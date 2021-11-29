import {
  InputCommand,
  InputCommandType,
  Settings,
  Storage,
} from '@spotter-app/core';
import React, { FC, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import pDebounce from 'p-debounce';
import { PREINSTALL_PLUGINS_LIST, SPOTTER_HOTKEY_IDENTIFIER } from '../core/constants';
import {
  InternalPluginLifecycle,
  PluginOutputCommand,
  SpotterHotkeyEvent,
  ExternalPluginOption,
  InternalPluginOption,
  isExternalPluginOption,
  RegisteredPrefixes,
  SpotterShell,
  ParseCommandsResult,
} from '../core/interfaces';
import { useApi } from './api.provider';
import { useSettings } from './settings.provider';
import { PluginsPlugin } from '../plugins/plugins.plugin';
import {
  forceReplaceOptions,
  getHistoryPath,
  parseCommands,
  onQueryExternalPluginAction,
  onQueryInternalPluginAction,
  sortOptions,
  triggerOnInitForInternalOrExternalPlugin,
  triggerOnInitForInternalAndExternalPlugins,
  checkForPluginsPrefixesToRegister,
  isLocalPluginPath,
  checkForPluginPrefixesToRegister,
  onPrefixForPlugins,
  parseOutput,
} from '../core/helpers';
import { useHistory } from './history.provider';
import { useStorage } from './storage.provider';
import { useSpotterState } from './state.provider';

type Context = {
  onQuery: (query: string) => Promise<void>,
  onSubmit: (index?: number) => void,
  onArrowUp: () => void,
  onArrowDown: () => void,
  onEscape: () => void,
  onCommandComma: () => void,
  onTab: () => void,
  onBackspace: () => void,
};

const context: Context = {
  onQuery: () => Promise.resolve(),
  onSubmit: () => null,
  onArrowUp: () => null,
  onArrowDown: () => null,
  onEscape: () => null,
  onCommandComma: () => null,
  onTab: () => null,
  onBackspace: () => null,
}

export const EventsContext = React.createContext<Context>(context);

export const EventsProvider: FC<{}> = (props) => {

  const { api } = useApi();
  const { getSettings, addPlugin, removePlugin, patchSettings } = useSettings();
  const { getHistory, increaseHistory } = useHistory();
  const { getStorage, patchStorage, setStorage } = useStorage();
  const {
    query,
    setQuery,
    setHint,
    options,
    setOptions,
    selectedOption,
    setSelectedOption,
    setLoading,
    setWaitingFor,
    hoveredOptionIndex,
    setHoveredOptionIndex,
    reset,
    registeredOptions,
    setRegisteredOptions,
    registeredPrefixes,
    setRegisteredPrefixes,
  } = useSpotterState()

  const debouncedOnPrefixForPlugins = useRef<(
    registeredPrefixes: RegisteredPrefixes,
    query: string,
    shell: SpotterShell,
    getStorage: (plugin: string) => Promise<Storage>,
    settings: Settings,
  ) => Promise<PluginOutputCommand[]>>();

  const registerPlugin = async (settings: Settings, plugin: string) => {
    if (settings.plugins.find(p => p === plugin)) {
      return;
    }

    const localPluginPath = RegExp('^(.+)\/([^\/]+)$').test(plugin);

    if (!localPluginPath) {
      await api.shell.execute(`npm i -g ${plugin}`);
    }

    addPlugin(plugin);

    const pluginStorage = await getStorage(plugin);

    const onInitCommands = await triggerOnInitForInternalOrExternalPlugin(
      plugin,
      api.shell,
      pluginStorage,
      settings,
    );

    const prefixesCommands = await checkForPluginPrefixesToRegister(
      plugin,
      api.shell,
    );

    const commands = [
      ...onInitCommands,
      ...prefixesCommands,
    ];

    handleCommands(parseCommands(commands));
  }

  const unregisterPlugin = async (plugin: string) => {
    const localPluginPath = RegExp('^(.+)\/([^\/]+)$').test(plugin);

    if (!localPluginPath) {
      await api.shell.execute(`npm uninstall -g ${plugin}`);
    }

    removePlugin(plugin);

    setRegisteredOptions((prevRegisteredOptions) => ({
      ...prevRegisteredOptions,
      [plugin]: [],
    }));

    setRegisteredPrefixes((prevRegisteredOptions) => ({
      ...prevRegisteredOptions,
      [plugin]: [],
    }));

    reset();
  }

  const internalPlugins: InternalPluginLifecycle[] = [
    new PluginsPlugin(api, getSettings, registerPlugin, unregisterPlugin),
  ];

  useEffect(() => {
    onInit();

    if (!debouncedOnPrefixForPlugins.current) {
      debouncedOnPrefixForPlugins.current = pDebounce(onPrefixForPlugins, 200);
    }
  }, []);

  const onInit = async () => {
    const settings = await getSettings();

    setWaitingFor('Installing dependencies...');
    await installDependencies();

    setWaitingFor('Registering hotkeys...');
    registerGlobalHotkeys(settings);
    setWaitingFor(null);

    const internalAndExternalPLugins = [
      ...internalPlugins,
      ...settings.plugins,
    ];

    const onInitCommands = await triggerOnInitForInternalAndExternalPlugins(
      internalAndExternalPLugins,
      api.shell,
      getStorage,
      settings,
    );

    const prefixesCommands = await checkForPluginsPrefixesToRegister(
      settings.plugins,
      api.shell,
    );

    const commands = [
      ...onInitCommands,
      ...prefixesCommands,
    ];

    handleCommands(parseCommands(commands));
  };

  const handleCommands = async (commands: ParseCommandsResult) => {
    const {
      optionsToRegister,
      optionsToSet,
      queryToSet,
      hintToSet,
      storageToSet,
      storageToPatch,
      settingsToPatch,
      prefixesToRegister,
      errorsToSet,
      logs,
    } = commands;

    if (optionsToRegister) {
      setRegisteredOptions(prevOptions => ({
        ...prevOptions,
        ...optionsToRegister,
      }));
    }

    if (optionsToSet) {
      const history = await getHistory();

      setOptions(sortOptions(
        forceReplaceOptions(optionsToSet),
        selectedOption,
        history,
      ));
    }

    if (queryToSet) {
      setQuery(queryToSet);
    }

    if (hintToSet) {
      setHint(hintToSet);
    }

    if (storageToSet) {
      setStorage(storageToSet)
    }

    if (storageToPatch) {
      patchStorage(storageToPatch)
    }

    if (settingsToPatch) {
      if (settingsToPatch.plugins?.length) {
        console.log('REGISTER NEW PLUGINS');
      }
      patchSettings(settingsToPatch)
    }

    if (prefixesToRegister) {
      setRegisteredPrefixes(prevPrefixes => ({
        ...prevPrefixes,
        ...prefixesToRegister,
      }));
    }

    if (errorsToSet?.length) {
      errorsToSet.forEach(err => Alert.alert(err));
    }

    if (logs?.length) {
      logs.forEach(log => console.log(log));
    }
  }

  const registerGlobalHotkeys = async (settings: Settings) => {
    api.globalHotKey.register(settings?.hotkey, SPOTTER_HOTKEY_IDENTIFIER);

    Object.entries(settings.pluginHotkeys).forEach(([plugin, options]) => {
      Object.entries(options).forEach(([option, hotkey]) => {
        api.globalHotKey.register(hotkey, `${plugin}#${option}`);
      });
    });

    api.globalHotKey.onPress(e => onPressHotkey(e));
  }

  const installDependencies = async () => {
    const nodeInstalled = await api.shell.execute('node -v').catch(() => false);
    if (nodeInstalled) {
      return;
    }

    const brewInstalled = await api.shell.execute('brew -v').catch(() => false);
    if (!brewInstalled) {
      await api.shell.execute('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
    }

    await api.shell.execute('brew install node');
  }

  const preinstallPlugins = async (settings: Settings) => {
    return Promise.all(PREINSTALL_PLUGINS_LIST.map(
      p => registerPlugin(settings, p),
    ));
  }

  const onPressHotkey = (e: SpotterHotkeyEvent) => {
    if (e.identifier === SPOTTER_HOTKEY_IDENTIFIER) {
      api.panel.open();
      return;
    };
  }

  const onEscape = () => {
    reset();
    api.panel.close();
  }

  const onBackspace = () => {
    if (selectedOption && !query.length) {
      reset();
    }
  }

  const onTab = async () => {
    const option = options[hoveredOptionIndex];

    if (!option || !option.queryAction) {
      return;
    }

    setSelectedOption(option);
    setQuery('');

    const pluginStorage = await getStorage(option.plugin);
    const settings = await getSettings();
    const commands: PluginOutputCommand[] = isExternalPluginOption(option)
      ? await onQueryExternalPluginAction(
        option,
        '',
        api.shell,
        pluginStorage,
        settings,
      )
      : await onQueryInternalPluginAction(option, '');

    increaseHistory(getHistoryPath(option, null));

    setHoveredOptionIndex(0);

    handleCommands(parseCommands(commands));
  }

  const onQuery = async (q: string) => {
    setQuery(q);

    if (selectedOption) {
      const pluginStorage = await getStorage(selectedOption.plugin);
      const settings = await getSettings();
      const commands: PluginOutputCommand[] = isExternalPluginOption(selectedOption)
        ? await onQueryExternalPluginAction(
          selectedOption,
          q,
          api.shell,
          pluginStorage,
          settings,
        )
        : await onQueryInternalPluginAction(selectedOption, q);

      handleCommands(parseCommands(commands));

      return;
    }

    if (q === '') {
      reset();
      return;
    }

    setLoading(true);

    const matchedPrefixes: RegisteredPrefixes = Object
      .entries(registeredPrefixes)
      .reduce<RegisteredPrefixes>((acc, [plugin, prefixes]) => {
        const filteredPrefixes = prefixes.filter(prefix => q.startsWith(prefix));
        const updatedPrefixes = [
          ...(acc[plugin] ? acc[plugin] : []),
          ...filteredPrefixes,
        ];

        return {
          ...acc,
          ...(updatedPrefixes.length ? {[plugin]: updatedPrefixes} : {}),
        };
      }, {});

    const settings = await getSettings();
    const prefixesCommands = Object.keys(matchedPrefixes)?.length && debouncedOnPrefixForPlugins.current
      ? await debouncedOnPrefixForPlugins.current(
          matchedPrefixes,
          q,
          api.shell,
          getStorage,
          settings,
        )
      : [];

    const commands = parseCommands(prefixesCommands);

    const filteredRegisteredOptions: ExternalPluginOption[] = Object
      .values(registeredOptions)
      .flat(1)
      .filter(o => o.title.toLowerCase().search(q.toLowerCase()) !== -1);

    commands.optionsToSet = [
      ...(commands?.optionsToSet ?? []),
      ...filteredRegisteredOptions,
    ];

    handleCommands(commands);

    setLoading(false);
  };

  const onArrowUp = () => {
    if (hoveredOptionIndex <= 0) {
      setHoveredOptionIndex(options.length - 1);
      return;
    }

    setHoveredOptionIndex(hoveredOptionIndex - 1)
  };

  const onArrowDown = () => {
    if (hoveredOptionIndex >= options.length - 1) {
      setHoveredOptionIndex(0);
      return;
    }

    setHoveredOptionIndex(hoveredOptionIndex + 1)
  };

  const onSubmitInternalOption = (option: InternalPluginOption) => {
    if (option.action) {
      option.action();
    }

    onEscape();
    return;
  };

  const onSubmitExternalOption = async (option: ExternalPluginOption) => {
    const pluginStorage = await getStorage(option.plugin);
    const settings = await getSettings();
    const command: InputCommand = {
      type: InputCommandType.onAction,
      action: option.action ?? '',
      query,
      storage: pluginStorage,
      settings,
    };

    const localPluginPath = isLocalPluginPath(option.plugin);

    const commands: PluginOutputCommand[] = await api.shell
      .execute(`${localPluginPath ? 'node ' : ''}${option.plugin} '${JSON.stringify(command)}'`)
      .then(v => parseOutput(option.plugin, v));

    handleCommands(parseCommands(commands));

    onEscape();
  }

  const onSubmit = async (index?: number) => {
    if (index || index === 0) {
      setHoveredOptionIndex(index);
    }

    const option = options[hoveredOptionIndex];

    if (!option) {
      return;
    }

    if (!option.action && option.queryAction) {
      onTab();
      return;
    }

    // setLoading(true);

    isExternalPluginOption(option)
      ? onSubmitExternalOption(option)
      : onSubmitInternalOption(option)

    increaseHistory(
      getHistoryPath(option, selectedOption),
    );
  }

  return (
    <EventsContext.Provider value={{
      ...context,
      onQuery,
      onEscape,
      onArrowUp,
      onArrowDown,
      onTab,
      onBackspace,
      onSubmit,
    }}>
      {props.children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => React.useContext(EventsContext);

