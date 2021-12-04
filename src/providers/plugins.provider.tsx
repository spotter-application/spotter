import {
  Command,
  CommandType,
  SpotterCommand,
  SpotterCommandType,
  SpotterOnGetStorageCommand,
  SpotterOnGetSettingsCommand,
  PluginChannel,
  PluginRegistryEntry,
  SpotterOnGetPluginsCommand,
} from '@spotter-app/core';
import React, { FC, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { BehaviorSubject, Subject, Observable, of, Subscription } from 'rxjs';
import {
  hideOptions,
  InternalPluginChannel,
  sortOptions,
  ExternalPluginChannel,
} from '../helpers';
import {
  Connection,
  PluginCommand,
  PluginOption,
  PluginPrefix,
} from '../interfaces';
import { INTERNAL_PLUGINS } from '../plugins';
import { useApi } from './api.provider';
import { useHistory } from './history.provider';
import { useSettings } from './settings.provider';
import { useSpotterState } from './state.provider';
import { useStorage } from './storage.provider';

const PLUGINS_STORAGE_KEY = 'PLUGINS';

type Context = {
  command$: Observable<Command>,
  connect: (plugin: string, port: number) => void,
  sendCommand: (command: SpotterCommand, plugin: string) => void,
};

const context: Context = {
  command$: of(),
  connect: () => null,
  sendCommand: () => null,
}

export const PluginsContext = React.createContext<Context>(context);

export const PluginsProvider: FC<{}> = (props) => {

  const {
    setQuery,
    setHint,
    setOptions,
    selectedOption,
    setRegisteredOptions,
    setRegisteredPrefixes,
    setDisplayedOptionsForCurrentWorkflow,
    reset,
  } = useSpotterState();
  const { getSettings, patchSettings } = useSettings();
  const { getStorage, setStorage, patchStorage } = useStorage();
  const { getHistory } = useHistory();
  const {
    panel,
    xCallbackUrlApi,
    shell,
    notifications,
    storage,
  } = useApi();

  const connectionsRef = useRef<BehaviorSubject<Connection[]>>(
    new BehaviorSubject<Connection[]>([]),
  );

  const commandRef = useRef<Subject<PluginCommand>>(
    new Subject<PluginCommand>()
  );

  const subscriptions: Subscription[] = [];

  useEffect(() => {
    onInit();
  }, []);

  useEffect(() => {
    return () => subscriptions.forEach(s => s.unsubscribe());
  }, []);

  const getPlugins: () => Promise<PluginRegistryEntry[]> = async () => {
    const plugins = await storage.getItem<PluginRegistryEntry[]>(PLUGINS_STORAGE_KEY);
    return plugins ?? [];
  }

  const addPlugin: (plugin: PluginRegistryEntry) => void = async (plugin) => {
    const plugins = await getPlugins();
    storage.setItem(PLUGINS_STORAGE_KEY, [...plugins, plugin]);
  }

  const removePlugin: (plugin: string) => void = async (plugin) => {
    const plugins = await getPlugins();
    storage.setItem(PLUGINS_STORAGE_KEY, plugins.filter(p => p.path !== plugin));
  }

  const onInit = async () => {
    connectRegisteredPlugins();
    xCallbackUrlApi.onCommand(handleCommand);
    subscriptions.push(commandRef.current.subscribe(handleCommand));
  };

  const connectRegisteredPlugins = async () => {
    const plugins = await getPlugins();
    plugins.forEach(async ({ path, port }) => start(path, port));
    Object.keys(INTERNAL_PLUGINS).forEach(plugin => connect(plugin, 11111, true));
  }

  const handleCommand = async (command: PluginCommand) => {
    if (command.type === CommandType.registerOptions) {
      setRegisteredOptions(prevOptions => {
        return command.value.map(o => ({...o, plugin: command.plugin})).reduce(
          (acc: PluginOption[], curr: PluginOption) => {
            const needsToBeReplaced = acc.find((o: PluginOption) =>
              o.title === curr.title && o.plugin === curr.plugin,
            );

            if (needsToBeReplaced) {
              return acc.map(o => {
                if (o.title === curr.title && o.plugin === curr.plugin) {
                  return curr;
                }

                return o;
              });
            }

            return [...acc, curr];
          },
          prevOptions,
        );
      });
      return;
    }

    if (command.type === CommandType.registerPrefixes) {
      setRegisteredPrefixes(prevPrefixes => {
        return command.value.map(p => ({...p, plugin: command.plugin})).reduce(
          (acc: PluginPrefix[], curr: PluginPrefix) => {
            const needsToBeReplaced = acc.find((p: PluginPrefix) =>
              p.prefix === curr.prefix && p.plugin === curr.plugin,
            );

            if (needsToBeReplaced) {
              return acc.map(p => {
                if (p.prefix === curr.prefix && p.plugin === curr.plugin) {
                  return curr;
                }

                return p;
              });
            }

            return [...acc, curr];
          },
          prevPrefixes,
        );
      });
      return;
    }

    if (command.type === CommandType.setOptions) {
      const history = await getHistory();
      const options = hideOptions(
        command.value.map(o => ({...o, plugin: command.plugin}))
      );
      const sortedOptions = sortOptions(
        options,
        selectedOption,
        history,
      );

      panel.open();
      setOptions(sortedOptions);
      if (sortedOptions.length) {
        setDisplayedOptionsForCurrentWorkflow(true);
      }
      return;
    }

    if (command.type === CommandType.setQuery) {
      setQuery(command.value);
      return;
    }

    if (command.type === CommandType.setHint) {
      setHint(command.value);
      return;
    }

    if (command.type === CommandType.setStorage) {
      setStorage(command.value);
      return;
    }

    if (command.type === CommandType.getStorage) {
      const data = await getStorage();
      const cmd: SpotterOnGetStorageCommand = {
        type: SpotterCommandType.onGetStorage,
        value: {
          id: command.value,
          data,
        }
      };
      sendCommand(cmd, command.plugin);
      return;
    }

    if (command.type === CommandType.patchStorage) {
      patchStorage(command.value);
      return;
    }

    if (command.type === CommandType.patchSettings) {
      patchSettings(command.value);
      return;
    }

    if (command.type === CommandType.getSettings) {
      const data = await getSettings();
      const cmd: SpotterOnGetSettingsCommand = {
        type: SpotterCommandType.onGetSettings,
        value: {
          id: command.value,
          data,
        }
      };

      sendCommand(cmd, command.plugin);
      return;
    }

    if (command.type === CommandType.getPlugins) {
      const data = await getPlugins();
      const cmd: SpotterOnGetPluginsCommand = {
        type: SpotterCommandType.onGetPlugins,
        value: {
          id: command.value,
          data,
        }
      };

      sendCommand(cmd, command.plugin);
      return;
    }

    if (command.type === CommandType.setError) {
      Alert.alert(command.value)
      return;
    }

    if (command.type === CommandType.addPlugin) {
      const plugins = await getPlugins();
      const registryEntry = plugins.find(
        p => p.path === command.value,
      );
      
      if (registryEntry) {
        const connection = connectionsRef.current.value.find(
          c => c.plugin === command.value,
        );

        if (connection) {
          notifications.show(
            'Warning',
            `Plugin ${command.value} already connected. Reconnecting...`,
          );
        }
      }

      const port = registryEntry?.port ?? Math.floor(10000 + Math.random() * 9000);
      if (!registryEntry) {
        addPlugin({ port, path: command.value });
      }
      start(command.value, port);
      return;
    }

    if (command.type === CommandType.connectPlugin) {
      connect('DEV_PLUGIN', command.value);
      return;
    }

    if (command.type === CommandType.removePlugin) {
      unregisterPlugin(command.value);
      removePlugin(command.value);
      return;
    }

    if (command.type === CommandType.open) {
      panel.open();
      return;
    }

    if (command.type === CommandType.close) {
      panel.close();
      reset();
      return;
    }
  }

  const start = async (
    plugin: string,
    port: number,
    internal?: boolean,
  ) => {
    if (internal) {
      connect(plugin, port, internal);
      return;
    }

    if (!port) {
      return;
    }

    const list = await shell.execute(`forever list ${plugin}`);
    const started = list.includes(plugin);
    if (started) {
      await shell.execute(`forever stop ${plugin}`);
    }

    await shell.execute(`forever start ${plugin} ${port}`);
    setTimeout(() => connect(plugin, port), 1000);
  }

  const connect = (
    plugin: string,
    port: number,
    internal?: boolean,
  ) => {
    if (!plugin || !port) {
      notifications.show('Connection', 'Wrong command has been passed');
      return;
    }

    const connections = connectionsRef.current.value;
    let error: string | null = null;

    const portOccupied = connections.find(c => c.port === port);
    if (portOccupied) {
      notifications.show(
        'Error',
        'Looks like port: `${port}` has been already occupied',
      );
      return;
    }

    const alreadyConnected = connections.find(c => c.plugin === plugin);
    if (alreadyConnected) {
      notifications.show(
        'Warning',
        'Looks like plugin: `${plugin}` has been already connected',
      );
      return;
    }

    const channel: PluginChannel = internal
      ? new InternalPluginChannel(plugin)
      : new ExternalPluginChannel(port);

    channel.onPlugin('open', async () => {
      connectionsRef.current.next([
        ...connectionsRef.current.value,
        {
          plugin,
          port,
          channel,
        }
      ]);

      const onInitCommand: SpotterCommand = {
        type: SpotterCommandType.onInit,
      };
      channel.sendToPlugin(JSON.stringify(onInitCommand));
    });

    channel.onPlugin('error', message => {
      error = message;
      notifications.show('Error', `Plugin ${plugin}: ${error}`)
      unregisterPlugin(plugin);
    });

    channel.onPlugin('close', () => {
      if (!error) {
        notifications.show('Connection', `Connection with ${plugin} has been terminated`);
      }
      unregisterPlugin(plugin);
    });

    channel.onPlugin('message', data => {
      const command = JSON.parse(data);
      commandRef.current.next({...command, plugin: plugin});
    });
  }

  const unregisterPlugin = (plugin: string) => {
    connectionsRef.current.next(
      connectionsRef.current.value.filter(c => c.plugin !== plugin),
    );
    setRegisteredOptions(prev => prev.filter(o => o.plugin !== plugin));
    setRegisteredPrefixes(prev => prev.filter(o => o.plugin !== plugin));
  }

  const sendCommand = (command: SpotterCommand, plugin: string) => {
    const connections = connectionsRef.current.value;
    const pluginConnection = connections.find(c => c.plugin === plugin);

    if (!pluginConnection) {
      console.error('There is no connection with plugin: ', plugin);
      return;
    }

    pluginConnection.channel.sendToPlugin(JSON.stringify(command));
  }

  return (
    <PluginsContext.Provider value={{
      ...context,
      command$: commandRef.current.asObservable(),
      connect,
      sendCommand,
    }}>
      {props.children}
    </PluginsContext.Provider>
  );
};

export const usePlugins = () => React.useContext(PluginsContext);
