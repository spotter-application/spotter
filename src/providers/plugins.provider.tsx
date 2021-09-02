import { Option } from '@spotter-app/core';
import React, { FC } from 'react';
import { SpotterPluginOption } from '../core/interfaces';
import { useApi } from './api.provider';

type Context = {
  onQuery: (query: string) => Promise<SpotterPluginOption[]>,
};

export const PluginsContext = React.createContext<Context>({
  onQuery: () => Promise.resolve([]),
});

export const PluginsProvider: FC<{}> = (props) => {

  const { api } = useApi();

  const plugins = ['spotter-spotify-plugin'];

  const onQuery = async (query: string) => {
    const options: SpotterPluginOption[][] = await Promise.all(plugins.map(
      async plugin => await api.shell.execute(`${plugin} query ${query}`)
        .then(v => v ? JSON.parse(v).map((o: Option) => ({...o, plugin})) : [])
    ));

    return options.flat(1);
  };

  return (
    <PluginsContext.Provider value={{onQuery}}>
      {props.children}
    </PluginsContext.Provider>
  );
};

export const usePlugins = () => React.useContext(PluginsContext);
