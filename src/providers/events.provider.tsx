import {
  InputCommand,
  InputCommandType,
  OutputCommand,
  OutputCommandType,
} from '@spotter-app/core/dist/interfaces';
import React, { FC, useEffect, useState } from 'react';
import { SPOTTER_HOTKEY_IDENTIFIER } from '../core/constants';
import { SpotterHotkeyEvent, SpotterPluginOption } from '../core/interfaces';
import { useApi } from './api.provider';
import { useSettings } from './settings.provider';

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
}

export const EventsContext = React.createContext<Context>(context);

export const EventsProvider: FC<{}> = (props) => {

  const { api } = useApi();
  const { getSettings } = useSettings();

  const [ query, setQuery ] = useState<string>('');
  const [ options, setOptions ] = useState<SpotterPluginOption[]>([]);
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ selectedOptionIndex, setSelectedOptionIndex ] = useState<number>(0);
  const [ registeredOptions, setRegisteredOptions ] = useState<SpotterPluginOption[]>([]);
  const plugins = ['spotter-spotify-plugin'];

  useEffect(() => {
    onInit();
  }, []);

  const sortOptions = (options: SpotterPluginOption[]): SpotterPluginOption[] => {
    // TODO: do
    return options;
  }

  const registerGlobalHotkeys = async () => {
    const settings = await getSettings();

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
    api.panel.close();
  }

  const onInit = async () => {
    registerGlobalHotkeys();

    await Promise.all(plugins.map(
      async plugin => {
        const command: InputCommand = {
          type: InputCommandType.onInit,
          query: '',
          storage: {},
        };

        const commands: OutputCommand[] = await api.shell.execute(`${plugin} '${JSON.stringify(command)}'`)
          .then(v => v ? v.split('\n').map(c => JSON.parse(c)) : []);

        commands.forEach(c => handleCommand(plugin, c));

        return options;
      }
    ));
  };

  const onQuery = async (q: string) => {
    setQuery(q);

    if (q === '') {
      reset();
      return;
    }

    setLoading(true);

    const options = registeredOptions.filter(o => {
      return o.title.toLowerCase().startsWith(q.toLowerCase());
    });

    const asyncOptions = await getAsyncOptionsAndHandleCommands(plugins, q);

    setOptions(sortOptions([...options, ...asyncOptions]));
    setLoading(false);
  };

  const getAsyncOptionsAndHandleCommands = async (plugins: string[], q: string): Promise<SpotterPluginOption[]> => {
    const pluginsOptions = await Promise.all(plugins.map(async plugin => {
      const inputCommand: InputCommand = {
        type: InputCommandType.onQuery,
        query: q,
        storage: {},
      };

      const commands: OutputCommand[] = await api.shell
        .execute(`${plugin} '${JSON.stringify(inputCommand)}'`)
        .catch(error => {
          const outputCommand: OutputCommand = {
            type: OutputCommandType.setOptions,
            value: [{
              title: `Error in ${plugin}: ${error}`,
            }],
          }

          return JSON.stringify(outputCommand);
        })
        .then(parseCommands);

        return commands.reduce<SpotterPluginOption[]>((acc, c) => {
          if (c.type === OutputCommandType.setOptions) {
            return [...acc, ...c.value.map(p => ({...p, plugin}))];
          }

          handleCommand(plugin, c);
          return acc;
        }, []);
    }));

    return pluginsOptions.flat(1);
  }

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

    setLoading(true);

    const command: InputCommand = {
      type: InputCommandType.onAction,
      query: option.action ?? '',
      storage: {},
    }

    const commands: OutputCommand[] = await api.shell
      .execute(`${option.plugin} '${JSON.stringify(command)}'`)
      .then(parseCommands);

    commands.forEach(command => handleCommand(option.plugin, command));

    onEscape();
  }

  const parseCommands = (value: string): OutputCommand[] => {
    return value ? value.split('\n').map(c => JSON.parse(c)) : [];
  }

  const handleCommand = (plugin: string, command: OutputCommand) => {
    if (command.type === OutputCommandType.registerOptions) {
      setRegisteredOptions([
        ...registeredOptions,
        ...command.value.map(o => ({ ...o, plugin }))
      ]);
      return;
    }

    if (command.type === OutputCommandType.setOptions) {
      setOptions(sortOptions([
        ...options,
        ...command.value.map(o => ({...o, plugin})),
      ]));
      return;
    }

    if (command.type === OutputCommandType.setQuery) {
      setQuery(command.value);
      return;
    }
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
    }}>
      {props.children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => React.useContext(EventsContext);
