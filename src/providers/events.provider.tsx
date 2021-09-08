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
  PluginOutputCommand,
  RegisteredOptions,
  SpotterHotkeyEvent,
  SpotterPluginOption,
} from '../core/interfaces';
import { useApi } from './api.provider';
import { Settings, useSettings } from './settings.provider';

const PATH = 'export PATH="/usr/local/share/npm/bin:/usr/local/bin:/usr/local/sbin:~/bin:$PATH"';

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
  options: SpotterPluginOption[],
  loading: boolean,
  selectedOptionIndex: number,
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
  loading: false,
  selectedOptionIndex: 0,
  shouldShowOptions: false,
}

export const EventsContext = React.createContext<Context>(context);

export const EventsProvider: FC<{}> = (props) => {

  const { api } = useApi();
  const { getSettings, addPlugin } = useSettings();

  const [ settings, setSettings ] = useState<Settings>();
  const [ query, setQuery ] = useState<string>('');
  const [ options, setOptions ] = useState<SpotterPluginOption[]>([]);
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ selectedOptionIndex, setSelectedOptionIndex ] = useState<number>(0);
  const [ registeredOptions, setRegisteredOptions ] = useState<RegisteredOptions>({});

  const [ shouldShowOptions, setShouldShowOptions ] = useState<boolean>(false);

  const shouldShowOptionsTimer = useRef<NodeJS.Timeout | null>();

  useEffect(() => {
    onInit();
  }, []);

  const onInit = async () => {
    const settings = await getSettings();

    setSettings(settings);

    registerGlobalHotkeys(settings);

    const commands = await settings.plugins.reduce<Promise<PluginOutputCommand[]>>(
      async (asyncAcc, plugin) => {
        return [
          ...(await asyncAcc),
          ...(await triggerOnInitForPlugin(plugin)),
        ]
      },
      Promise.resolve([])
    );

    const { optionsToRegister } = handleCommands(commands);

    if (optionsToRegister) {
      setRegisteredOptions(prevOptions => ({
        ...prevOptions,
        ...optionsToRegister,
      }));
    }
  };

  const sortOptions = (options: SpotterPluginOption[]): SpotterPluginOption[] => {
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
    setSelectedOptionIndex(0);
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

  const triggerOnInitForPlugin = async (plugin: string): Promise<PluginOutputCommand[]> => {
    const command: InputCommand = {
      type: InputCommandType.onInit,
      storage: {},
    };

    return await api.shell.execute(`${PATH} && ${plugin} '${JSON.stringify(command)}'`)
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

    if (q === 'i') {
      registerPlugin('spotter-applications-plugin');
      // const install = await api.shell.execute(`${PATH} && npm install -g spotter-applications-plugin`);
      // setOptions([{
      //   title: install,
      //   plugin: '',
      // }]);
      return;
    }

    setLoading(true);

    const options = Object.values(registeredOptions).flat(1).filter(o => {
      return o.title.toLowerCase().search(q.toLowerCase()) !== -1;
    });

    // const { optionsToSet }: HandleCommandResult = handleCommands(
    //   await onExternalPluginsQuery(q),
    // );

    setLoading(false);

    setOptions(sortOptions([
      ...options,
      // ...(optionsToSet ?? []),
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

  // const onExternalPluginsQuery = async (q: string): Promise<PluginOutputCommand[]> => {
  //   const plugins = settings?.plugins ?? [];

  //   const pluginsOptions: PluginOutputCommand[][] = await Promise.all(plugins.map(async plugin => {
  //     const inputCommand: InputCommand = {
  //       type: InputCommandType.onQueryAction,
  //       query: q,
  //       storage: {},
  //     };

  //     return await api.shell
  //       .execute(`${PATH} && ${plugin} '${JSON.stringify(inputCommand)}'`)
  //       .catch(error => {
  //         const outputCommand: PluginOutputCommand = {
  //           type: OutputCommandType.setOptions,
  //           value: [{
  //             title: `Error in ${plugin}: ${error}`,
  //           }],
  //           plugin,
  //         }

  //         return JSON.stringify(outputCommand);
  //       })
  //       .then(v => parseCommands(plugin, v));
  //   }));

  //   return pluginsOptions.flat();

  //   // return await Promise.all(await plugins.reduce<Promise<PluginOutputCommand[]>>(async (asyncAcc, plugin) => {
  //   //   const inputCommand: InputCommand = {
  //   //     type: InputCommandType.onQuery,
  //   //     query: q,
  //   //     storage: {},
  //   //   };

  //   //   const commands: OutputCommand[] = await api.shell
  //   //     .execute(`${PATH} && ${plugin} '${JSON.stringify(inputCommand)}'`)
  //   //     .catch(error => {
  //   //       const outputCommand: OutputCommand = {
  //   //         type: OutputCommandType.setOptions,
  //   //         value: [{
  //   //           title: `Error in ${plugin}: ${error}`,
  //   //         }],
  //   //       }

  //   //       return JSON.stringify(outputCommand);
  //   //     })
  //   //     .then(v => parseCommands(plugin, v));

  //   //   return [
  //   //     ...(await asyncAcc),
  //   //     ...commands.map(c => ({...c, plugin})),
  //   //   ];
  //   // }, Promise.resolve([])));
  // }

  const onArrowUp = () => {
    if (selectedOptionIndex <= 0) {
      setSelectedOptionIndex(options.length - 1);
      return;
    }

    setSelectedOptionIndex(selectedOptionIndex - 1)
  };

  const onArrowDown = () => {
    if (selectedOptionIndex >= options.length - 1) {
      setSelectedOptionIndex(0);
      return;
    }

    setSelectedOptionIndex(selectedOptionIndex + 1)
  };

  const onSubmit = async (index?: number) => {
    if (index || index === 0) {
      setSelectedOptionIndex(index);
    }

    const option = options[selectedOptionIndex];

    if (!option) {
      return;
    }

    setLoading(true);

    const command: InputCommand = {
      type: InputCommandType.onAction,
      action: option.action ?? '',
      query,
      storage: {},
    }

    const commands: OutputCommand[] = await api.shell
      .execute(`${PATH} && ${option.plugin} '${JSON.stringify(command)}'`)
      .then(v => parseCommands(option.plugin, v));

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

      const optionsToSet: SpotterPluginOption[] | null = handleCommandResult.optionsToSet
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
      onSubmit,
      query,
      options,
      loading,
      selectedOptionIndex,
      shouldShowOptions,
    }}>
      {props.children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => React.useContext(EventsContext);
