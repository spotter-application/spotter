import {
  InputCommand,
  InputCommandType,
} from '@spotter-app/core/dist/interfaces';
import React, { FC, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { SHOW_OPTIONS_DELAY, SPOTTER_HOTKEY_IDENTIFIER } from '../core/constants';
import {
  InternalPluginLifecycle,
  PluginOutputCommand,
  RegisteredOptions,
  SpotterHotkeyEvent,
  ExternalPluginOption,
  InternalPluginOption,
  isExternalPluginOption,
  Options,
  RegisteredPrefixes,
} from '../core/interfaces';
import { useApi } from './api.provider';
import { Settings, useSettings } from './settings.provider';
import { PluginsPlugin } from '../plugins/plugins.plugin';
import {
  forceReplaceOptions,
  getHistoryPath,
  handleCommands,
  onQueryExternalPluginAction,
  onQueryInternalPluginAction,
  sortOptions,
  triggerOnInitForInternalOrExternalPlugin,
  triggerOnInitForInternalAndExternalPlugins,
  checkForPluginsPrefixesToRegister,
  isLocalPluginPath,
  checkForPluginPrefixesToRegister,
  onPrefixForPlugins,
} from '../core/helpers';
import { useHistory } from './history.provider';
import { useStorage } from './storage.provider';

type Context = {
  onQuery: (query: string) => Promise<void>,
  onSubmit: (index?: number) => void,
  onArrowUp: () => void,
  onArrowDown: () => void,
  onEscape: () => void,
  onCommandComma: () => void,
  onTab: () => void,
  onBackspace: () => void,
  query: string,
  options: Array<InternalPluginOption | ExternalPluginOption>,
  selectedOption: InternalPluginOption | ExternalPluginOption | null,
  loading: boolean,
  hoveredOptionIndex: number,
  shouldShowOptions: boolean,
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
  query: '',
  options: [],
  selectedOption: null,
  loading: false,
  hoveredOptionIndex: 0,
  shouldShowOptions: false,
}

export const EventsContext = React.createContext<Context>(context);

export const EventsProvider: FC<{}> = (props) => {

  const { api } = useApi();
  const { getSettings, addPlugin, removePlugin } = useSettings();
  const { getHistory, increaseHistory } = useHistory();
  const { getStorage, patchStorage } = useStorage();

  const [ query, setQuery ] = useState<string>('');
  const [ options, setOptions ] = useState<Options>([]);
  const [ selectedOption, setSelectedOption] = useState<ExternalPluginOption | InternalPluginOption | null>(null);
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ hoveredOptionIndex, setHoveredOptionIndex ] = useState<number>(0);
  const [ registeredOptions, setRegisteredOptions ] = useState<RegisteredOptions>({});
  const [ registeredPrefixes, setRegisteredPrefixes ] = useState<RegisteredPrefixes>({});

  const [ shouldShowOptions, setShouldShowOptions ] = useState<boolean>(false);

  const shouldShowOptionsTimer = useRef<NodeJS.Timeout | null>();

  const registerPlugin = async (plugin: string) => {
    addPlugin(plugin);
    const storage = await getStorage();

    const onInitCommands = await triggerOnInitForInternalOrExternalPlugin(
      plugin,
      api.shell,
      storage[plugin] ?? {},
    );

    const prefixesCommands = await checkForPluginPrefixesToRegister(
      plugin,
      api.shell,
    );

    const commands = [
      ...onInitCommands,
      ...prefixesCommands,
    ];

    const {
      optionsToRegister,
      dataToStorage,
      prefixesToRegister,
      errorsToSet,
    } = handleCommands(commands);

    if (errorsToSet) {
      errorsToSet.forEach(Alert.alert);
    }

    if (prefixesToRegister) {
      setRegisteredPrefixes(prevPrefixes => ({
        ...prevPrefixes,
        ...prefixesToRegister,
      }));
    }

    if (dataToStorage) {
      patchStorage(dataToStorage);
    }

    if (optionsToRegister) {
      setRegisteredOptions(prevOptions => ({
        ...prevOptions,
        ...optionsToRegister,
      }));
    }
  }

  const unregisterPlugin = (plugin: string) => {
    removePlugin(plugin);
    setRegisteredOptions((prevRegisteredOptions) => ({
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
  }, []);

  const onInit = async () => {
    const settings = await getSettings();
    const storage = await getStorage();

    registerGlobalHotkeys(settings);

    const internalAndExternalPLugins = [
      ...internalPlugins,
      ...settings.plugins,
    ];

    const onInitCommands = await triggerOnInitForInternalAndExternalPlugins(
      internalAndExternalPLugins,
      api.shell,
      storage,
    );

    const prefixesCommands = await checkForPluginsPrefixesToRegister(
      settings.plugins,
      api.shell,
    );

    const commands = [
      ...onInitCommands,
      ...prefixesCommands,
    ];

    const {
      optionsToRegister,
      optionsToSet,
      dataToStorage,
      prefixesToRegister,
      errorsToSet,
    } = handleCommands(commands);

    if (errorsToSet?.length) {
      errorsToSet.forEach(Alert.alert);
    }

    if (prefixesToRegister) {
      setRegisteredPrefixes(prevPrefixes => ({
        ...prevPrefixes,
        ...prefixesToRegister,
      }));
    }

    if (dataToStorage) {
      patchStorage(dataToStorage)
    }

    if (optionsToSet) {
      const history = await getHistory();
      setOptions(
        sortOptions(
          forceReplaceOptions(optionsToSet),
          selectedOption,
          history,
        ),
      );
    }

    if (optionsToRegister) {
      setRegisteredOptions(prevOptions => ({
        ...prevOptions,
        ...optionsToRegister,
      }));
    }
  };

  const registerGlobalHotkeys = async (settings: Settings) => {
    api.globalHotKey.register(settings?.hotkey, SPOTTER_HOTKEY_IDENTIFIER);

    Object.entries(settings.pluginHotkeys).forEach(([plugin, options]) => {
      Object.entries(options).forEach(([option, hotkey]) => {
        api.globalHotKey.register(hotkey, `${plugin}#${option}`);
      });
    });

    api.globalHotKey.onPress(e => onPressHotkey(e));
  }

  const onPressHotkey = (e: SpotterHotkeyEvent) => {
    if (e.identifier === SPOTTER_HOTKEY_IDENTIFIER) {
      api.panel.open();
      return;
    };
  }

  const reset = () => {
    setQuery('');
    setLoading(false);
    setOptions([]);
    setHoveredOptionIndex(0);
    setSelectedOption(null);
  }

  const onEscape = () => {
    reset();
    setShouldShowOptions(false);
    if (shouldShowOptionsTimer.current) {
      clearTimeout(shouldShowOptionsTimer.current);
    }
    shouldShowOptionsTimer.current = null;
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

    const storage = await getStorage();
    const commands: PluginOutputCommand[] = isExternalPluginOption(option)
      ? await onQueryExternalPluginAction(
        option,
        '',
        api.shell,
        storage[option.plugin] ?? {}
      )
      : await onQueryInternalPluginAction(option, '');

    const { optionsToSet, dataToStorage } = handleCommands(commands);

    if (dataToStorage) {
      patchStorage(dataToStorage);
    }

    const history = await getHistory();
    increaseHistory(getHistoryPath(option, null));
    setOptions(
      sortOptions(
        forceReplaceOptions(optionsToSet ?? []),
        selectedOption,
        history,
      ),
    );
    setHoveredOptionIndex(0);
  }

  const onQuery = async (q: string) => {
    // TODO: add warning message UI
    // if (!settings?.plugins?.filter(p => typeof p === 'string').length) {
      // setOptions([{
      //   title: 'You don`t have any installed plugins',
      //   plugin: '',
      // }]);
      // return;
    // }

    setQuery(q);

    if (selectedOption) {
      const storage = await getStorage();
      const commands: PluginOutputCommand[] = isExternalPluginOption(selectedOption)
        ? await onQueryExternalPluginAction(
          selectedOption,
          q,
          api.shell,
          storage[selectedOption.plugin] ?? {}
        )
        : await onQueryInternalPluginAction(selectedOption, q);

      const { optionsToSet, dataToStorage } = handleCommands(commands);

      if (dataToStorage) {
        patchStorage(dataToStorage);
      }

      const history = await getHistory();
      setOptions(
        sortOptions(
          forceReplaceOptions(optionsToSet ?? []),
          selectedOption,
          history,
        ),
      );
      return;
    }

    if (q === '') {
      reset();
      return;
    }

    setLoading(true);

    const shouldTriggerPrefixes: RegisteredPrefixes = Object
      .entries(registeredPrefixes)
      .reduce<RegisteredPrefixes>((acc, [plugin, prefixes]) => {
        const filteredPrefixes = prefixes.filter(prefix => q.startsWith(prefix));

        return {
          ...acc,
          [plugin]: [
            ...(acc[plugin] ? acc[plugin] : []),
            ...filteredPrefixes,
          ],
        };
      }, {});

    const storage = await getStorage();
    const prefixesCommands = await onPrefixForPlugins(
      shouldTriggerPrefixes,
      q,
      api.shell,
      storage,
    );

    const { optionsToSet, queryToSet } = handleCommands(prefixesCommands);

    if (queryToSet) {
      setQuery(queryToSet);
    }

    const filteredRegisteredOptions = Object
      .values(registeredOptions)
      .flat(1)
      .filter(o => o.title.toLowerCase().search(q.toLowerCase()) !== -1);

    const options = [
      ...(optionsToSet ? optionsToSet : []),
      ...filteredRegisteredOptions,
    ];

    setLoading(false);

    const history = await getHistory();
    setOptions(
      sortOptions(
        forceReplaceOptions(options),
        selectedOption,
        history,
      ),
    );

    if (!shouldShowOptionsTimer.current) {
      shouldShowOptionsTimer.current = setTimeout(() => {
        setShouldShowOptions(prevShouldShowOptions => {
          if (!prevShouldShowOptions) {
            return true;
          }

          return prevShouldShowOptions;
        });
      }, SHOW_OPTIONS_DELAY);
    }
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
    const storage = await getStorage();
    const command: InputCommand = {
      type: InputCommandType.onAction,
      action: option.action ?? '',
      query,
      storage: storage[option.plugin] ?? {},
    };

    const localPluginPath = isLocalPluginPath(option.plugin);

    const commands: PluginOutputCommand[] = await api.shell
      .execute(`${localPluginPath ? 'node ' : ''}${option.plugin} '${JSON.stringify(command)}'`)
      .then(v => parseCommands(option.plugin, v));

    const { dataToStorage } = handleCommands(commands);

    if (dataToStorage) {
      patchStorage(dataToStorage);
    }
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

    setLoading(true);

    isExternalPluginOption(option)
      ? onSubmitExternalOption(option)
      : onSubmitInternalOption(option)

    increaseHistory(
      getHistoryPath(option, selectedOption),
    );

    onEscape();
  }

  const parseCommands = (plugin: string, value: string): PluginOutputCommand[] => {
    return value ? value.split('\n').map(c => ({...JSON.parse(c), plugin})) : [];
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
      query,
      options,
      loading,
      hoveredOptionIndex,
      shouldShowOptions,
      selectedOption,
    }}>
      {props.children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => React.useContext(EventsContext);
