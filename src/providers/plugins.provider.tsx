import React, { FC } from 'react';
import { useApi } from './api.provider';
import { useSettings } from './settings.provider';
import { checkForPluginPrefixesToRegister, parseCommands, triggerPluginOnInit } from '../core/helpers';
import { useStorage } from './storage.provider';
import { ParseCommandsResult } from '../core';

type Context = {
  registerPlugin: (plugin: string) => Promise<ParseCommandsResult | undefined>,
  unregisterPlugin: (plugin: string) => Promise<void>,
};

const context: Context = {
  registerPlugin: () => Promise.resolve(undefined),
  unregisterPlugin: () => Promise.resolve(),
}

export const PluginsContext = React.createContext<Context>(context);

export const PluginsProvider: FC<{}> = (props) => {

  const { api } = useApi();
  const { getSettings, addPlugin, removePlugin } = useSettings();
  const { getStorage } = useStorage();

  const registerPlugin = async (plugin: string) => {
    const settings = await getSettings()
    if (settings.plugins.find(p => p === plugin)) {
      return;
    }

    await api.shell.execute(`npm i -g ${plugin}`);

    addPlugin(plugin);
    const pluginStorage = await getStorage(plugin);

    const onInitCommands = await triggerPluginOnInit(
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

    return parseCommands(commands);
  }

  const unregisterPlugin = async (plugin: string) => {
    await api.shell.execute(`npm uninstall -g ${plugin}`);

    removePlugin(plugin);
  }

  return (
    <PluginsContext.Provider value={{
      ...context,
      registerPlugin,
      unregisterPlugin,
    }}>
      {props.children}
    </PluginsContext.Provider>
  );
};

export const usePlugins = () => React.useContext(PluginsContext);
