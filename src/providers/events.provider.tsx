import { Option } from '@spotter-app/core';
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

  const plugins = ['spotter-spotify-plugin'];

  useEffect(() => {
    registerGlobalHotkeys();
  }, []);

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
    console.log(e);

    if (e.identifier === SPOTTER_HOTKEY_IDENTIFIER) {
      api.panel.open();
      return;
    };

    // const [plugin, option] = e.identifier.split('#');
  }

  const onEscape = () => {
    setQuery('');
    setLoading(false);
    setOptions([]);
    setSelectedOptionIndex(0);

    api.panel.close();
  }

  const onQuery = async (query: string) => {
    setQuery(query);
    setLoading(true);

    const options: SpotterPluginOption[][] = await Promise.all(plugins.map(
      async plugin => await api.shell.execute(`${plugin} query ${query}`)
        .then(v => v ? JSON.parse(v).map((o: Option) => ({...o, plugin})) : [])
    ));

    setLoading(false);

    setSelectedOptionIndex(0);

    setOptions(options.flat(1));
  };

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

    await api.shell.execute(`${option.plugin} action ${option.action}`);

    onEscape();
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
