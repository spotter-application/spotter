import {
  Command,
  CommandType,
  SpotterCommand,
  SpotterCommandType,
  SpotterOnGetStorageCommand,
  SpotterOnGetSettingsCommand,
  PluginRegistryEntry,
  SpotterOnGetPluginsCommand,
  ChannelForSpotter,
  randomPort,
  StartPluginInfo,
} from '@spotter-app/core';
import React, { FC, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { Subject, Observable, of, Subscription } from 'rxjs';
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
    registeredOptions$,
    registeredPrefixes$,
    selectedOption$,
    options$,
    query$,
    displayedOptionsForCurrentWorkflow$,
    placeholder$,
    resetState,
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

  const connectionsRef = useRef<Connection[]>([]);

  const commandRef = useRef<Subject<PluginCommand>>(
    new Subject<PluginCommand>()
  );

  const pluginScriptProcessesRef = useRef<{[plugin: string]: number}>(
    {},
  );

  const subscriptions: Subscription[] = [];

  useEffect(() => {
    onInit();
  }, []);

  useEffect(() => {
    Object.keys(pluginScriptProcessesRef.current).forEach(stopPluginScript);
    return () => subscriptions.forEach(s => s.unsubscribe());
  }, []);

  const onInit = async () => {
    // Start plugins
    const plugins = await getPlugins();
    plugins.forEach(startPlugin);
    Object.keys(INTERNAL_PLUGINS).forEach(plugin =>
      connectPlugin(plugin, 11111, true)
    );

    xCallbackUrlApi.onCommand(handleCommand);
    subscriptions.push(commandRef.current.subscribe(handleCommand));
  };

  const getPlugins: () => Promise<PluginRegistryEntry[]> = async () => {
    const plugins = await storage.getItem<PluginRegistryEntry[]>(PLUGINS_STORAGE_KEY);
    return plugins ?? [];
  }

  const startPlugin: (
    plugin: PluginRegistryEntry,
  ) => void = async (plugin) => {
    const plugins = await getPlugins();

    const registryEntry = plugins.find(p => p === plugin);

    if (!registryEntry) {
      storage.setItem(PLUGINS_STORAGE_KEY, [...plugins, plugin]);
    }

    await stopPluginScript(plugin);

    const port = randomPort();
    const { pid } = await startPluginScript(plugin, port);
    pluginScriptProcessesRef.current[plugin] = pid;
    setTimeout(() => connectPlugin(plugin, port), 1000);
  }

  const removePlugin: (
    plugin: string,
  ) => void = async (plugin) => {
    const plugins = await getPlugins();
    storage.setItem(PLUGINS_STORAGE_KEY, plugins.filter(p => p !== plugin));

    connectionsRef.current = connectionsRef.current.filter(c => c.plugin !== plugin);
    registeredOptions$.next(
      registeredOptions$.value.filter(o => o.plugin !== plugin),
    );
    registeredPrefixes$.next(
      registeredPrefixes$.value.filter(o => o.plugin !== plugin),
    );

    stopPluginScript(plugin);
  }

  const handleCommand = async (command: PluginCommand) => {
    if (command.type === CommandType.registerOptions) {
      const nextRegisteredOptions = command.value
        .map(o => ({...o, plugin: command.plugin}))
        .reduce(
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
          registeredOptions$.value,
        );
      registeredOptions$.next(nextRegisteredOptions);
      return;
    }

    if (command.type === CommandType.registerPrefixes) {
      const nextRegisteredPrefixes = command.value
        .map(p => ({...p, plugin: command.plugin}))
        .reduce(
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
          registeredPrefixes$.value,
        );
      registeredPrefixes$.next(nextRegisteredPrefixes);
      return;
    }

    if (command.type === CommandType.setOptions) {
      const history = await getHistory();
      const options = hideOptions(
        command.value.map(o => ({...o, plugin: command.plugin}))
      );
      const sortedOptions = sortOptions(
        options,
        selectedOption$.value,
        history,
      );

      panel.open();
      options$.next(sortedOptions);
      if (sortedOptions.length) {
        displayedOptionsForCurrentWorkflow$.next(true);
      }
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

    if (command.type === CommandType.getPlugins) { const data = await getPlugins();
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
      startPlugin(command.value);
      return;
    }

    if (command.type === CommandType.connectPlugin) {
      connectPlugin('DEV_PLUGIN', command.value);
      return;
    }

    if (command.type === CommandType.removePlugin) {
      removePlugin(command.value);
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
    plugin: string,
    port: number,
  ): Promise<StartPluginInfo> => {
    if (!port) {
      return Promise.reject();
    }

    return shell
      .execute(`nohup node ${plugin} ${port} > /dev/null 2>&1 &`)
      .then(result => JSON.parse(`"${result}"`));
  }

  const stopPluginScript = async (
    plugin: string,
  ): Promise<string> => {
    const pluginScriptProcess = pluginScriptProcessesRef.current[plugin];

    if (!pluginScriptProcess) {
      return Promise.resolve('');
    }

    delete pluginScriptProcessesRef.current[plugin];
    return shell.execute(`kill ${pluginScriptProcess}`);
  }

  const connectPlugin = (
    plugin: string,
    port: number,
    internal?: boolean,
  ) => {
    if (!plugin || !port) {
      notifications.show('Connection', 'Wrong command has been passed');
      return;
    }

    const connections = connectionsRef.current;

    const connectionOnSamePort = connections.find(c => c.port === port);
    if (connectionOnSamePort) {
      if (connectionOnSamePort.plugin !== plugin) {
        notifications.show(
          'Error',
          `Port: ${port} occupied`,
        );
        return;
      }
      connectionOnSamePort.channel.close();
    }

    const samePluginConnection = connections.find(c => c.plugin === plugin);
    if (samePluginConnection) {
      samePluginConnection.channel.close();
    }

    const channel: ChannelForSpotter = internal
      ? new InternalPluginChannel(plugin)
      : new ExternalPluginChannel(port);

    channel.onPlugin('open', async () => {
      connectionsRef.current.push(
        {
          plugin,
          port,
          channel,
        }
      );

      const onInitCommand: SpotterCommand = {
        type: SpotterCommandType.onInit,
      };
      channel.sendToPlugin(JSON.stringify(onInitCommand));
    });

    let error: string | null = null;

    channel.onPlugin('error', message => {
      error = message;
      notifications.show('Error', `Plugin ${plugin}: ${error}`)
      removePlugin(plugin);
    });

    channel.onPlugin('close', () => {
      if (!error) {
        notifications.show('Connection', `Connection with ${plugin} has been terminated`);
      }
    });

    channel.onPlugin('message', data => {
      const command = JSON.parse(data);
      commandRef.current.next({...command, plugin: plugin});
    });
  }

  const sendCommand = (command: SpotterCommand, plugin: string) => {
    const connections = connectionsRef.current;
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
      connect: connectPlugin,
      sendCommand,
    }}>
      {props.children}
    </PluginsContext.Provider>
  );
};

export const usePlugins = () => React.useContext(PluginsContext);
