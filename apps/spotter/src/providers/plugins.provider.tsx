import {
  CommandType,
  SpotterCommand,
  SpotterCommandType,
  SpotterOnGetStorageCommand,
  SpotterOnGetSettingsCommand,
  SpotterOnGetPluginsCommand,
  ChannelForSpotter,
  randomPort,
  Command,
  PluginConnection,
} from '@spotter-app/core';
import React, { FC, useEffect } from 'react';
import { Alert } from 'react-native';
import { Subject, Subscription, BehaviorSubject } from 'rxjs';
import { INTERNAL_PLUGINS, PLUGINS_STORAGE_KEY } from '../constants';
import {
  replaceOptions,
  InternalPluginChannel,
  sortOptions,
  ExternalPluginChannel,
} from '../helpers';
import {
  ActivePlugin,
  isPluginOnQueryOption,
  PluginCommand,
  PluginRegistryOption,
} from '../interfaces';
import { useApi } from './api.provider';
import { useHistory } from './history.provider';
import { useSettings } from './settings.provider';
import { useSpotterState } from './state.provider';
import { useStorage } from './storage.provider';

type Context = {
  sendCommand: (command: SpotterCommand, pluginName: string) => void,
};

const context: Context = {
  sendCommand: () => null,
}

export const PluginsContext = React.createContext<Context>(context);

export const PluginsProvider: FC<{}> = (props) => {

  const {
    registeredOptions$,
    selectedOption$,
    options$,
    query$,
    placeholder$,
    hoveredOptionIndex$,
    loading$,
    resetState,
  } = useSpotterState();

  const { getSettings, patchSettings, setTheme } = useSettings();
  const { getStorage, setStorage, patchStorage } = useStorage();
  const { getHistory } = useHistory();
  const {
    panel,
    xCallbackUrlApi,
    shell,
    notifications,
    storage,
  } = useApi();

  const command$ = new Subject<PluginCommand>();

  const activePlugins$ = new BehaviorSubject<ActivePlugin[]>([]);

  const subscriptions: Subscription[] = [];

  useEffect(() => {
    onInit();
  }, []);

  useEffect(() => {
    return () => {
      activePlugins$.value.forEach(({pid}) => stopPluginScript(pid))
      subscriptions.forEach(s => s.unsubscribe())
    };
  }, []);

  const onInit = async () => {
    // Start plugins
    const plugins = await getRegisteredPlugins();
    plugins.forEach(p => startPluginScript(p.path));
    Object.keys(INTERNAL_PLUGINS).forEach(plugin => {
      const channel = connectPlugin(plugin);
      if (!channel) {
        console.error('Error.');
        return;
      }
      const nextActivePlugin: ActivePlugin = {
        name: plugin,
        path: plugin,
        channel,
        pid: 0,
        port: 0,
      };
      listenPlugin(nextActivePlugin);
      activePlugins$.next([
        ...activePlugins$.value,
        nextActivePlugin,
      ]);
    });

    xCallbackUrlApi.onCommand(handleCommand);
    subscriptions.push(command$.subscribe(handleCommand));
  };

  const getRegisteredPlugins: () => Promise<PluginConnection[]> = async () => {
    const plugins = await storage.getItem<PluginConnection[]>(PLUGINS_STORAGE_KEY);
    return plugins ?? [];
  }

  const removePlugin: (
    pluginName: string,
  ) => void = async (pluginName) => {
    const plugins = await getRegisteredPlugins();
    storage.setItem(PLUGINS_STORAGE_KEY, plugins.filter(p => p.name !== pluginName));
    removePluginRegistries(pluginName);
    const activePlugin = activePlugins$.value.find(p => 
      p.name === pluginName,
    );
    if (activePlugin) {
      stopPluginScript(activePlugin.pid);
      activePlugins$.next(activePlugins$.value.filter(p => 
        p.name !== pluginName,
      ));
    }
  }

  const removePluginRegistries = (
    pluginName: string,
  ) => {
    registeredOptions$.next(
      registeredOptions$.value.filter(o => o.pluginName !== pluginName),
    );
  }

  const setRegisteredOptionsCommand = (
    command: (PluginCommand & {type: CommandType.setRegisteredOptions})
  ) => {
    const nextRegisteredOptions = command.value
    .map(o => ({...o, pluginName: command.pluginName}))
    .reduce(
      (acc: PluginRegistryOption[], curr: PluginRegistryOption) => {
        const needsToBeReplaced = acc.find((o: PluginRegistryOption) =>
          o.title === curr.title && o.pluginName === curr.pluginName,
        );

        if (needsToBeReplaced) {
          return acc.map(o => {
            if (o.title === curr.title && o.pluginName === curr.pluginName) {
              return curr;
            }

            return o;
          });
        }

        return [...acc, curr];
      },
      registeredOptions$.value.filter(o => o.pluginName !== command.pluginName),
    );
    registeredOptions$.next(nextRegisteredOptions);
  }

  const patchRegisteredOptionsCommand = (
    command: (PluginCommand & {type: CommandType.patchRegisteredOptions})
  ) => {
    const nextRegisteredOptions = command.value
    .map(o => ({...o, pluginName: command.pluginName}))
    .reduce(
      (acc: PluginRegistryOption[], curr: PluginRegistryOption) => {
        const needsToBeReplaced = acc.find((o: PluginRegistryOption) =>
          o.title === curr.title && o.pluginName === curr.pluginName,
        );

        if (needsToBeReplaced) {
          return acc.map(o => {
            if (o.title === curr.title && o.pluginName === curr.pluginName) {
              return curr;
            }

            return o;
          });
        }

        return [...acc, curr];
      },
      registeredOptions$.value,
    );
    registeredOptions$.next(nextRegisteredOptions);
  }

  const setOnQueryOptionsCommand = async (
    command: (PluginCommand & {type: CommandType.setOnQueryOptions})
  ) => {
    const history = await getHistory();
    const options = replaceOptions(
      command.value.map(o => ({...o, pluginName: command.pluginName}))
    );
    const sortedOptions = sortOptions(
      options,
      selectedOption$.value,
      history,
    );

    const optionWithHoveredPropIndex = sortedOptions.findIndex(o =>
      isPluginOnQueryOption(o) && o.hovered,
    );

    const nextHoveredOptionIndex = optionWithHoveredPropIndex !== -1
      ? optionWithHoveredPropIndex
      : 0;

    options$.next(sortedOptions);
    hoveredOptionIndex$.next(nextHoveredOptionIndex);
  }

  const getStorageCommand = async (
    command: (PluginCommand & {type: CommandType.getStorage})
  ) => {
    const data = await getStorage(command.pluginName);
    const cmd: SpotterOnGetStorageCommand = {
      type: SpotterCommandType.onGetStorage,
      value: {
        id: command.value,
        data,
      }
    };
    sendCommand(cmd, command.pluginName);
  }

  const getSettingsCommand = async (
    command: (PluginCommand & {type: CommandType.getSettings})
  ) => {
    const data = await getSettings();
    const cmd: SpotterOnGetSettingsCommand = {
      type: SpotterCommandType.onGetSettings,
      value: {
        id: command.value,
        data,
      }
    };
    sendCommand(cmd, command.pluginName);
  }

  const getPluginsCommand = async (
    command: (PluginCommand & {type: CommandType.getPlugins})
  ) => {
    const registeredPlugins = await getRegisteredPlugins();

    const connectedPlugins: PluginConnection[] = activePlugins$.value.map(({
      name, path, port, pid, icon, version, documentationUrl,
    }) => ({
      name, path, port, pid, icon, version, documentationUrl,
    }));

    const notConnectedPlugins: PluginConnection[] = registeredPlugins
      .filter(p => !connectedPlugins.find(cp => cp.path === p.path))
      .map(p => ({ ...p, port: 0, pid: 0 }));

    const cmd: SpotterOnGetPluginsCommand = {
      type: SpotterCommandType.onGetPlugins,
      value: {
        id: command.value,
        data: [
          ...notConnectedPlugins,
          ...connectedPlugins,
        ],
      }
    };
    sendCommand(cmd, command.pluginName);
  }

  const connectPluginCommand = async (
    command: (PluginCommand & {type: CommandType.connectPlugin})
  ) => {
    // Parse emoji
    if (command.value.icon) {
      if (!isNaN(parseInt(command.value.icon, 16))) {
        command.value.icon = String.fromCodePoint(
          parseInt(command.value.icon, 16),
        );
      }
    }

    // TODO: check if plugin doesn't have a uniq name
    // Otherwise there will be a conflict when setting data to storage
    const activePlugin = activePlugins$.value.find(p =>
      p.name === command.value.name,
    );

    if (activePlugin) {
      activePlugins$.next(
        activePlugins$.value.filter(p => p.name !== activePlugin.name),
      );
      stopPluginScript(activePlugin.pid);
      removePluginRegistries(activePlugin.name);
    };

    const plugins = await getRegisteredPlugins();
    const registryEntry = plugins.find(p => p.path === command.value.path);

    const isInternalPlugin = !command.value.pid;
    const isDevelopment = command.value.name === command.value.path;
    
    if (!registryEntry && !isInternalPlugin && !isDevelopment) {
      storage.setItem(
        PLUGINS_STORAGE_KEY,
        [...plugins, command.value]);
      notifications.show('Plugin', `${command.value.name} has been added to registry`);
    }

    const channel: ChannelForSpotter | null = connectPlugin(
      command.value.path,
      command.value.port,
    );

    if (!channel) {
      // TODO: check
      console.error('Error');
      return;
    }

    const plugin: ActivePlugin = {
      ...command.value,
      channel,
    }

    listenPlugin(plugin);

    activePlugins$.next([
      ...activePlugins$.value,
      plugin,
    ]);
  }

  const handleCommand = async (command: PluginCommand) => {
    if (command.type === CommandType.setRegisteredOptions) {
      setRegisteredOptionsCommand(command);
      return;
    }

    if (command.type === CommandType.patchRegisteredOptions) {
      patchRegisteredOptionsCommand(command);
      return;
    }

    if (command.type === CommandType.setOnQueryOptions) {
      setOnQueryOptionsCommand(command);
      return;
    }

    if (command.type === CommandType.setQuery) {
      query$.next(command.value);
      return;
    }

    if (command.type === CommandType.setPlaceholder) {
      placeholder$.next(command.value);
      return;
    }

    if (command.type === CommandType.setStorage) {
      setStorage(command.value, command.pluginName);
      return;
    }

    if (command.type === CommandType.getStorage) {
      getStorageCommand(command);
      return;
    }

    if (command.type === CommandType.patchStorage) {
      patchStorage(command.value, command.pluginName);
      return;
    }

    if (command.type === CommandType.patchSettings) {
      patchSettings(command.value);
      return;
    }

    if (command.type === CommandType.getSettings) {
      getSettingsCommand(command);
      return;
    }

    if (command.type === CommandType.getPlugins) {
      getPluginsCommand(command);
      return;
    }

    if (command.type === CommandType.setError) {
      Alert.alert(command.value);
      return;
    }

    if (command.type === CommandType.startPluginScript) {
      try {
        startPluginScript(command.value);
      } catch (e) {
        Alert.alert(`${e}`)
      }
      return;
    }

    if (command.type === CommandType.connectPlugin) {
      connectPluginCommand(command);
      return;
    }

    if (command.type === CommandType.removePlugin) {
      removePlugin(command.value);
      return;
    }

    if (command.type === CommandType.setTheme) {
      setTheme(command.value);
      return;
    }

    if (command.type === CommandType.setLoading) {
      loading$.next(command.value);
      return;
    }

    if (command.type === CommandType.open) {
      panel.open();
      return;
    }

    if (command.type === CommandType.close) {
      panel.close();
      resetState();
      return;
    }
  }

  const startPluginScript = async (
    pluginPath: string,
  ): Promise<string> => {
    const activePlugin = activePlugins$.value.find(p => 
      p.path === pluginPath,
    );

    if (activePlugin) {
      await stopPluginScript(activePlugin.pid);
    }

    const port = uniqPort();

    return shell.execute(`nohup node ${pluginPath} ${port} ${pluginPath} > /dev/null 2>&1 &`);
  }

  const uniqPort = (): number => {
    const port = randomPort();
    const activePluginWithPort = activePlugins$.value.find(p =>
      p.port === port,
    );

    return activePluginWithPort ? uniqPort() : port;
  }

  const stopPluginScript = async (
    pid: number,
  ) => {
    return await shell.execute(`kill ${pid} || echo 'Process was not running.'`);
  }

  const connectPlugin = (
    plugin: string,
    port?: number,
  ): ChannelForSpotter | null => {
    if (!plugin) {
      notifications.show('Connection', 'Wrong command has been passed');
      return null;
    }

    return port
      ? new ExternalPluginChannel(port)
      : new InternalPluginChannel(plugin);
  }

  const listenPlugin = (plugin: ActivePlugin) => {
    plugin.channel.onPlugin('open', async () => {
      const onInitCommand: SpotterCommand = {
        type: SpotterCommandType.onInit,
      };
      plugin.channel.sendToPlugin(JSON.stringify(onInitCommand));
    });

    plugin.channel.onPlugin('error', () => {
      const activePlugin = activePlugins$.value.find(p =>
        p.pid === plugin.pid && p.port === p.port,
      );
      if (!activePlugin) {
        return;
      }
      stopPluginScript(plugin.pid);
      removePluginRegistries(plugin.name);
      activePlugins$.next(
        activePlugins$.value.filter(p => p.pid !== plugin.pid),
      );
    });

    plugin.channel.onPlugin('close', () => {
      const activePlugin = activePlugins$.value.find(p =>
        p.pid === plugin.pid && p.port === p.port,
      );
      if (!activePlugin) {
        return;
      }
      stopPluginScript(plugin.pid);
      removePluginRegistries(plugin.name);
      activePlugins$.next(
        activePlugins$.value.filter(p => p.pid !== plugin.pid),
      );
    });

    plugin.channel.onPlugin('message', data => {
      const command: Command = JSON.parse(data);
      command$.next({...command, pluginName: plugin.name});
    });
  }

  const sendCommand = (command: SpotterCommand, pluginName: string) => {
    const plugin = activePlugins$.value.find(p => p.name === pluginName);

    if (!plugin) {
      console.error('There is no connection with plugin: ', pluginName);
      return;
    }

    plugin.channel.sendToPlugin(JSON.stringify(command));
  }

  return (
    <PluginsContext.Provider value={{
      ...context,
      sendCommand,
    }}>
      {props.children}
    </PluginsContext.Provider>
  );
};

export const usePlugins = () => React.useContext(PluginsContext);
