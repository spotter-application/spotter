import {
  InputCommand,
  InputCommandType,
  OutputCommand,
  OutputCommandType,
} from '@spotter-app/core/dist/interfaces';
import React, { FC, useEffect, useRef, useState } from 'react';
import { SHOW_OPTIONS_DELAY, SPOTTER_HOTKEY_IDENTIFIER } from '../core/constants';
import {
  HandleCommandResult,
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
  const { getSettings, addPlugin } = useSettings();

  const [ settings, setSettings ] = useState<Settings>();
  const [ query, setQuery ] = useState<string>('');
  const [ options, setOptions ] = useState<Array<ExternalPluginOption | InternalPluginOption>>([]);
  const [ selectedOption, setSelectedOption] = useState<ExternalPluginOption | InternalPluginOption | null>(null);
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ hoveredOptionIndex, setHoveredOptionIndex ] = useState<number>(0);
  const [ registeredOptions, setRegisteredOptions ] = useState<RegisteredOptions>({});

  const [ shouldShowOptions, setShouldShowOptions ] = useState<boolean>(false);

  const shouldShowOptionsTimer = useRef<NodeJS.Timeout | null>();

  const internalPlugins: InternalPluginLifecycle[] = [
    new PluginsPlugin(api),
  ];

  useEffect(() => {
    onInit();
  }, []);

  const onInit = async () => {
    const settings = await getSettings();

    setSettings(settings);

    registerGlobalHotkeys(settings);

    const externalPluginsCommands = await [
      ...internalPlugins,
      ...settings.plugins
    ].reduce<Promise<PluginOutputCommand[]>>(
      async (asyncAcc, plugin) => {
        return [
          ...(await asyncAcc),
          ...(await triggerOnInitForPlugin(plugin)),
        ]
      },
      Promise.resolve([]),
    );

    const { optionsToRegister } = handleCommands(externalPluginsCommands);

    if (optionsToRegister) {
      setRegisteredOptions(prevOptions => ({
        ...prevOptions,
        ...optionsToRegister,
      }));
    }
  };

  const sortOptions = (
    options: Array<InternalPluginOption | ExternalPluginOption>
  ): Array<InternalPluginOption | ExternalPluginOption> => {
    // TODO: do
    return options;
  }

  const registerPlugin = (plugin: string) => {
    addPlugin(plugin);
    triggerOnInitForPlugin(plugin);
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

  const onPressHotkey = (e: SpotterHotkeyEvent) => {
    if (e.identifier === SPOTTER_HOTKEY_IDENTIFIER) {
      api.panel.open();
      return;
    };

    // const [plugin, option] = e.identifier.split('#');
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

  const onTab = () => {
    const option = options[hoveredOptionIndex];

    if (!option || !option.queryAction) {
      return;
    }

    setSelectedOption(option);
    setQuery('');
    setOptions([]);
  }

  const triggerOnInitForPlugin = async (
    plugin: string | InternalPluginLifecycle,
  ): Promise<PluginOutputCommand[]> => {
    const command: InputCommand = {
      type: InputCommandType.onInit,
      storage: {},
    };

    const isInternalPlugin = typeof plugin === 'object';

    if (isInternalPlugin) {
      if (!plugin?.onInit) {
        return [];
      }

      const outputCommand: PluginOutputCommand = {
        type: OutputCommandType.registerOptions,
        value: plugin.onInit() ?? [],
        plugin: '',
      };
      return Promise.resolve([outputCommand]);
    }

    return await api.shell.execute(`${plugin} '${JSON.stringify(command)}'`)
      .then(v => v ? v.split('\n').map(c => ({...(JSON.parse(c)), plugin})) : [])
      .catch(error => {
        const outputCommand: PluginOutputCommand = {
          type: OutputCommandType.setOptions,
          value: [{
            title: `Error in ${plugin}: ${error}`,
          }],
          plugin,
        };

        return [outputCommand];
      });
  }

  const onQuery = async (q: string) => {
    if (!settings?.plugins?.length) {
      setOptions([{
        title: 'You don`t have any installed plugins',
        plugin: '',
      }]);
      return;
    }

    setQuery(q);

    if (q === '') {
      reset();
      return;
    }

    setLoading(true);

    const options = Object.values(registeredOptions).flat(1).filter(o => {
      return o.title.toLowerCase().search(q.toLowerCase()) !== -1;
    });

    setLoading(false);

    setOptions(sortOptions([
      ...options,
    ]));

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

    setLoading(true);

    isExternalPluginOption(option)
      ? onSubmitExternalOption(option)
      : onSubmitInternalOption(option)

    onEscape();
  }

  const parseCommands = (plugin: string, value: string): PluginOutputCommand[] => {
    return value ? value.split('\n').map(c => ({...JSON.parse(c), plugin})) : [];
  }

  const handleCommands = (commands: PluginOutputCommand[]): HandleCommandResult => {
    return commands.reduce<HandleCommandResult>((acc, command) => {
      const handleCommandResult: HandleCommandResult = handleCommand(command);

      const optionsToRegister: RegisteredOptions | null = handleCommandResult.optionsToRegister
        ? {...(acc.optionsToRegister ?? {}), ...handleCommandResult.optionsToRegister}
        : acc.optionsToRegister;

      const optionsToSet: ExternalPluginOption[] | null = handleCommandResult.optionsToSet
        ? [...(acc.optionsToSet ?? []), ...handleCommandResult.optionsToSet]
        : acc.optionsToSet;

      return {
        optionsToRegister,
        optionsToSet,
        queryToSet: handleCommandResult.queryToSet ?? acc.queryToSet,
      };
    }, {
      optionsToRegister: null,
      optionsToSet: null,
      queryToSet: null,
    });
  }

  const handleCommand = (command: PluginOutputCommand): HandleCommandResult => {
    const initialData: HandleCommandResult = {
      optionsToRegister: null,
      optionsToSet: null,
      queryToSet: null,
    };

    if (command.type === OutputCommandType.registerOptions) {
      return {
        ...initialData,
        optionsToRegister: {
          [command.plugin]: command.value.map(o =>
            ({ ...o, plugin: command.plugin })
          ),
        }
      };
    }

    if (command.type === OutputCommandType.setOptions) {
      setOptions((prevOptions) => sortOptions([
        ...prevOptions,
        ...command.value.map(o => ({...o, plugin: command.plugin})),
      ]));
      return {
        ...initialData,
        optionsToSet: command.value.map(o => ({...o, plugin: command.plugin})),
      };
    }

    if (command.type === OutputCommandType.setQuery) {
      setQuery(command.value);
      return {
        ...initialData,
        queryToSet: command.value,
      };
    }

    return initialData;
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
