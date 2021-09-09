import {
  InputCommand,
  InputCommandType,
  OutputCommand,
} from '@spotter-app/core/dist/interfaces';
import React, { FC, useEffect, useRef, useState } from 'react';
import { SHOW_OPTIONS_DELAY, SPOTTER_HOTKEY_IDENTIFIER } from '../core/constants';
import {
  InternalPluginLifecycle,
  PluginOutputCommand,
  RegisteredOptions,
  SpotterHotkeyEvent,
  ExternalPluginOption,
  InternalPluginOption,
  isExternalPluginOption,
} from '../core/interfaces';
import { useApi } from './api.provider';
import { Settings, useSettings } from './settings.provider';
import { PluginsPlugin } from '../plugins/plugins.plugin';
import { getHistoryPath, handleCommands, sortOptions, triggerOnInitForPlugin } from '../core/helpers';
import { useHistory } from './history.provider';

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

  const [ query, setQuery ] = useState<string>('');
  const [ options, setOptions ] = useState<Array<ExternalPluginOption | InternalPluginOption>>([]);
  const [ selectedOption, setSelectedOption] = useState<ExternalPluginOption | InternalPluginOption | null>(null);
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ hoveredOptionIndex, setHoveredOptionIndex ] = useState<number>(0);
  const [ registeredOptions, setRegisteredOptions ] = useState<RegisteredOptions>({});

  const [ shouldShowOptions, setShouldShowOptions ] = useState<boolean>(false);

  const shouldShowOptionsTimer = useRef<NodeJS.Timeout | null>();

  const registerPlugin = async (plugin: string) => {
    addPlugin(plugin);
    const commands = await triggerOnInitForPlugin(plugin, api.shell);

    const { optionsToRegister } = handleCommands(commands);

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

    registerGlobalHotkeys(settings);

    const externalPluginsCommands = await [
      ...internalPlugins,
      ...settings.plugins
    ].reduce<Promise<PluginOutputCommand[]>>(
      async (asyncAcc, plugin) => {
        return [
          ...(await asyncAcc),
          ...(await triggerOnInitForPlugin(plugin, api.shell)),
        ]
      },
      Promise.resolve([]),
    );

    const {
      optionsToRegister,
      optionsToSet,
    } = handleCommands(externalPluginsCommands);

    if (optionsToSet) {
      const history = await getHistory();
      setOptions(sortOptions(optionsToSet, selectedOption, history));
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

    const selectedOptionOptions: InternalPluginOption[] = isExternalPluginOption(option)
      ? []
      : await onQueryInternalPluginAction(option, '');

    const history = await getHistory();

    increaseHistory(getHistoryPath(option, null));
    setOptions(sortOptions(selectedOptionOptions, selectedOption, history));
    setHoveredOptionIndex(0);
  }

  const onQueryInternalPluginAction = async (
    option: InternalPluginOption,
    query: string
  ): Promise<InternalPluginOption[]> => {
    if (!option || !option.queryAction) {
      return [];
    }

    return await option.queryAction(query);
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
      const selectedOptionOptions: InternalPluginOption[] = isExternalPluginOption(selectedOption)
        ? []
        : await onQueryInternalPluginAction(selectedOption, q);

      const history = await getHistory();
      setOptions(sortOptions(selectedOptionOptions, selectedOption, history));
      return;
    }

    if (q === '') {
      reset();
      return;
    }

    setLoading(true);

    const options = Object.values(registeredOptions).flat(1).filter(o => {
      return o.title.toLowerCase().search(q.toLowerCase()) !== -1;
    });

    setLoading(false);

    const history = await getHistory();
    setOptions(sortOptions(options, selectedOption, history));

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
    const command: InputCommand = {
      type: InputCommandType.onAction,
      action: option.action ?? '',
      query,
      storage: {},
    }

    const commands: OutputCommand[] = await api.shell
      .execute(`${option.plugin} '${JSON.stringify(command)}'`)
      .then(v => parseCommands(option.plugin, v));
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
