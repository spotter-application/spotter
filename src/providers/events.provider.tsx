import { Option } from '@spotter-app/core';
import React, { FC, useEffect, useState } from 'react';
import { SPOTTER_HOTKEY_IDENTIFIER } from '../core/constants';
import { SpotterHotkeyEvent, SpotterPluginOption } from '../core/interfaces';
import { useApi } from './api.provider';
import { useSettings } from './settings.provider';

type Context = {
  onQuery: (query: string) => Promise<void>,
  onSubmit: () => void,
  onArrowUp: () => void,
  onArrowDown: () => void,
  onEscape: () => void,
  onCommandComma: () => void,
  onTab: () => void,
  onBackspace: () => void,
  query: string,
  options: SpotterPluginOption[],
  loading: boolean,
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
}

export const EventsContext = React.createContext<Context>(context);

export const EventsProvider: FC<{}> = (props) => {

  const { api } = useApi();
  const { getSettings } = useSettings();

  const [ query, setQuery ] = useState<string>('');
  const [ options, setOptions ] = useState<SpotterPluginOption[]>([]);
  const [ loading, setLoading ] = useState<boolean>(false);

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

    console.log(options);

    setOptions(options.flat(1));
  };

  return (
    <EventsContext.Provider value={{
      ...context,
      onQuery,
      onEscape,
      query,
      options,
      loading,
    }}>
      {props.children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => React.useContext(EventsContext);
