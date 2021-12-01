import {
  PluginCommand,
  SpotterCommandType,
  PluginOption,
  PluginPrefix,
  PluginCommandType,
  Settings,
  Storage,
  SpotterCommand,
} from '@spotter-app/core';
import React, { FC, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import pDebounce from 'p-debounce';
import { SPOTTER_HOTKEY_IDENTIFIER, SYSTEM_PLUGINS_LIST } from '../constants';
import {
  SpotterHotkeyEvent,
  SpotterShellApi,
} from '../interfaces';
import { useApi } from './api.provider';
import { useSettings } from './settings.provider';
import { hideOptions, getHistoryPath } from '../helpers';
import { useHistory } from './history.provider';
import { useStorage } from './storage.provider';
import { useSpotterState } from './state.provider';
import { usePlugins } from '.';
import { Subscription, distinctUntilChanged } from 'rxjs';

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
  const { panel, shell, hotkey } = useApi();
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
    hoveredOptionIndex,
    setHoveredOptionIndex,
    reset,
    registeredOptions,
    setRegisteredOptions,
    registeredPrefixes,
    setRegisteredPrefixes,
  } = useSpotterState();

  const { sendCommand } = usePlugins();

  // const debouncedOnPrefixForPlugins = useRef<(
  //   registeredPrefixes: RegisteredPrefixes,
  //   query: string,
  //   shell: SpotterShellApi,
  //   getStorage: (plugin: string) => Promise<Storage>,
  //   settings: Settings,
  // ) => Promise<PluginOutputCommand[]>>();

  // const registerPlugin = async (settings: Settings, plugin: string) => {
  //   if (settings.plugins.find(p => p === plugin)) {
  //     return;
  //   }

  //   const localPluginPath = RegExp('^(.+)\/([^\/]+)$').test(plugin);

  //   if (!localPluginPath) {
  //     await api.shell.execute(`npm i -g ${plugin}`);
  //   }

  //   addPlugin(plugin);

  //   const pluginStorage = await getStorage(plugin);

  //   const onInitCommands = await triggerPluginOnInit(
  //     plugin,
  //     api.shell,
  //     pluginStorage,
  //     settings,
  //   );

  //   const prefixesCommands = await checkForPluginPrefixesToRegister(
  //     plugin,
  //     api.shell,
  //   );

  //   const commands = [
  //     ...onInitCommands,
  //     ...prefixesCommands,
  //   ];

  //   handleCommands(parseCommands(commands));
  // }

  // const unregisterPlugin = async (plugin: string) => {
  //   const localPluginPath = RegExp('^(.+)\/([^\/]+)$').test(plugin);

  //   if (!localPluginPath) {
  //     await api.shell.execute(`npm uninstall -g ${plugin}`);
  //   }

  //   removePlugin(plugin);

  //   setRegisteredOptions((prevRegisteredOptions) => ({
  //     ...prevRegisteredOptions,
  //     [plugin]: [],
  //   }));

  //   setRegisteredPrefixes((prevRegisteredOptions) => ({
  //     ...prevRegisteredOptions,
  //     [plugin]: [],
  //   }));

  //   reset();
  // }

  useEffect(() => {
    onInit();

    // if (!debouncedOnPrefixForPlugins.current) {
    //   debouncedOnPrefixForPlugins.current = pDebounce(onPluginsPrefix, 200);
    // }
  }, []);

  const onInit = async () => {
    const settings = await getSettings();
    await installDependencies();
    registerHotkeys(settings);
  };

  const registerHotkeys = async (settings: Settings) => {
    hotkey.register(settings?.hotkey, SPOTTER_HOTKEY_IDENTIFIER);

    Object.entries(settings.pluginHotkeys).forEach(([plugin, options]) => {
      Object.entries(options).forEach(([option, shortcut]) => {
        hotkey.register(shortcut, `${plugin}#${option}`);
      });
    });

    hotkey.onPress(e => onPressHotkey(e));
  }

  const installDependencies = async () => {
    const nodeInstalled = await shell.execute('node -v').catch(() => false);
    if (nodeInstalled) {
      return;
    }

    const brewInstalled = await shell.execute('brew -v').catch(() => false);
    if (!brewInstalled) {
      await shell.execute('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
    }

    await shell.execute('brew install node');
  }

  const onPressHotkey = (e: SpotterHotkeyEvent) => {
    if (e.identifier === SPOTTER_HOTKEY_IDENTIFIER) {
      panel.open();
      return;
    };
  }

  const onEscape = () => {
    reset();
    panel.close();
  }

  const onBackspace = () => {
    if (selectedOption && !query.length) {
      reset();
    }
  }

  const onTab = async () => {
    // const option = options[hoveredOptionIndex];

    // if (!option || !option.queryAction) {
    //   return;
    // }

    // setSelectedOption(option);
    // setQuery('');

    // const pluginStorage = await getStorage(option.plugin);
    // const settings = await getSettings();
    // const commands: PluginCommand[] = await onPluginQuery(
    //   option,
    //   '',
    //   shell,
    //   pluginStorage,
    //   settings,
    // );

    // increaseHistory(getHistoryPath(option, null));

    // setHoveredOptionIndex(0);

    // handleCommands(parseCommands(commands));
  }

  const onQuery = async (nextQuery: string) => {
    setQuery(nextQuery);

    if (nextQuery === '') {
      reset();
      return;
    }

    const matchedPrefixes = registeredPrefixes.filter(
      p => nextQuery.startsWith(p.prefix),
    );

    console.log(matchedPrefixes);

    if (matchedPrefixes.length) {

      matchedPrefixes.forEach(async p => {
        const command: SpotterCommand = {
          type: SpotterCommandType.onAction,
          query: nextQuery,
          actionId: p.actionId,
        }
        sendCommand(command, p.plugin);
      })
    }

    return;


    // if (selectedOption) {
    //   const pluginStorage = await getStorage(selectedOption.plugin);
    //   const settings = await getSettings();
    //   const commands: PluginOutputCommand[] = await onPluginQuery(
    //     selectedOption,
    //     q,
    //     api.shell,
    //     pluginStorage,
    //     settings,
    //   );

    //   // handleCommands(parseCommands(commands));

    //   return;
    // }

    // if (q === '') {
    //   reset();
    //   return;
    // }

    // setLoading(true);

    // // const matchedPrefixes: RegisteredPrefixes = Object
    // //   .entries(registeredPrefixes)
    // //   .reduce<RegisteredPrefixes>((acc, [plugin, prefixes]) => {
    // //     const filteredPrefixes = prefixes.filter(prefix => q.startsWith(prefix));
    // //     const updatedPrefixes = [
    // //       ...(acc[plugin] ? acc[plugin] : []),
    // //       ...filteredPrefixes,
    // //     ];

    // //     return {
    // //       ...acc,
    // //       ...(updatedPrefixes.length ? {[plugin]: updatedPrefixes} : {}),
    // //     };
    // //   }, {});

    // const settings = await getSettings();
    // // const prefixesCommands = Object.keys(matchedPrefixes)?.length && debouncedOnPrefixForPlugins.current
    // //   ? await debouncedOnPrefixForPlugins.current(
    // //       matchedPrefixes,
    // //       q,
    // //       api.shell,
    // //       getStorage,
    // //       settings,
    // //     )
    // //   : [];

    // // const commands = parseCommands(prefixesCommands);

    // // const filteredRegisteredOptions: PluginOption[] = Object
    // //   .values(registeredOptions)
    // //   .flat(1)
    // //   .filter(o => o.title.toLowerCase().search(q.toLowerCase()) !== -1);

    // // commands.optionsToSet = [
    // //   ...(commands?.optionsToSet ?? []),
    // //   ...filteredRegisteredOptions,
    // // ];

    // // handleCommands(commands);

    // setLoading(false);
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

  const onSubmit = async (index?: number) => {
    if (index || index === 0) {
      setHoveredOptionIndex(index);
    }

    const option = options[hoveredOptionIndex];

    if (!option) {
      return;
    }

    if (!option.actionId && option.tabActionId) {
      onTab();
      return;
    }

    if (!option.actionId) {
      return;
    }

    setLoading(true);

    const command: SpotterCommand = {
      type: SpotterCommandType.onAction,
      actionId: option.actionId,
      query,
    };

    sendCommand(command, option.plugin);


    // const localPluginPath = isLocalPluginPath(option.plugin);

    // const commands: PluginOutputCommand[] = await api.shell
    //   .execute(`${localPluginPath ? 'node ' : ''}${option.plugin} '${JSON.stringify(command)}'`)
    //   .then(v => parseOutput(option.plugin, v));

    // handleCommands(parseCommands(commands));

    // onEscape();

    // increaseHistory(getHistoryPath(option, selectedOption));
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
