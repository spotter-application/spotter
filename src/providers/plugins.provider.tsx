import {
  Command,
  CommandType,
  SpotterCommand,
  SpotterCommandType,
  SpotterOnGetStorageCommand,
  SpotterOnGetSettingsCommand,
} from '@spotter-app/core';
import React, { FC, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { BehaviorSubject, Subject, Observable, of, Subscription } from 'rxjs';
import { hideOptions, sortOptions } from '../helpers';
import { Connection, PluginCommand, PluginOption, PluginPrefix } from '../interfaces';
import { useApi } from './api.provider';
import { useHistory } from './history.provider';
import { useSettings } from './settings.provider';
import { useSpotterState } from './state.provider';
import { useStorage } from './storage.provider';

type Context = {
  command$: Observable<Command>,
  connect: (plugin: string, port: number) => void,
  sendCommand: (command: SpotterCommand, plugin?: string) => void,
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
  const { panel, xCallbackUrlApi, shell, notifications } = useApi();

  const connectionsRef = useRef<BehaviorSubject<Connection[]>>(
    new BehaviorSubject<Connection[]>([])
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

  const onInit = async () => {
    connectRegisteredPlugins();
    xCallbackUrlApi.onCommand(handleCommand);
    subscriptions.push(commandRef.current.subscribe(handleCommand));
  };

  const connectRegisteredPlugins = async () => {
    const settings = await getSettings();
    settings.plugins.forEach(async ({ path, port }) => start(path, port));
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
      const options = hideOptions(command.value);
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
      sendCommand(cmd);
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

      sendCommand(cmd);
      return;
    }

    if (command.type === CommandType.setError) {
      Alert.alert(command.value)
      return;
    }

    if (command.type === CommandType.addPlugin) {
      const settings = await getSettings();
      const registryEntry = settings.plugins.find(
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
        patchSettings({plugins: [
          ...settings.plugins,
          { port, path: command.value },
        ]});
      }
      start(command.value, port);
      return;
    }

    if (command.type === CommandType.connectPlugin) {
      notifications.show('Connecting', 'Connecting with DEV_PLUGIN');
      connect('DEV_PLUGIN', command.value);
      return;
    }

    if (command.type === CommandType.removePlugin) {
      console.log('REMOVE PLUGIN', command.value)
      console.log('TODO');
      // connect(command.value, command.value);
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

  const start = async (plugin: string, port: number) => {
    const list = await shell.execute(`forever list ${plugin}`);
    const started = list.includes(plugin);
    if (started) {
      await shell.execute(`forever stop ${plugin}`);
    }

    await shell.execute(`forever start ${plugin} ${port}`);
    setTimeout(() => connect(plugin, port), 1000);
  }

  const connect = (plugin: string, port: number) => {
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

    const ws = new WebSocket(`ws://127.0.0.1:${port}`);

    ws.onopen = async () => {
      connectionsRef.current.next([
        ...connectionsRef.current.value,
        {
          plugin,
          port,
          ws,
        }
      ]);

      const onInitCommand: SpotterCommand = {
        type: SpotterCommandType.onInit,
      };
      ws.send(JSON.stringify(onInitCommand));
    };

    ws.onerror = ({ message }) => {
      error = message;
      notifications.show('Error', `Plugin ${plugin}: ${message}`)
      connectionsRef.current.next(
        connectionsRef.current.value.filter(c => c.plugin !== plugin),
      );
      setRegisteredOptions(prev => prev.filter(o => o.plugin !== plugin));
      setRegisteredPrefixes(prev => prev.filter(o => o.plugin !== plugin));
    };

    ws.onclose = () => {
      if (!error) {
        notifications.show('Connection', `Connection with ${plugin} has been terminated`);
      }

      connectionsRef.current.next(
        connectionsRef.current.value.filter(c => c.plugin !== plugin),
      );
      setRegisteredOptions(prev => prev.filter(o => o.plugin !== plugin));
      setRegisteredPrefixes(prev => prev.filter(o => o.plugin !== plugin));
    };

    ws.onmessage = ({ data }) => {
      const command = JSON.parse(data);
      commandRef.current.next({...command, plugin});
    };
  }

  const sendCommand = (command: SpotterCommand, plugin?: string) => {
    const connections = connectionsRef.current.value;

    if (!plugin) {
      connections.forEach(c => c.ws.send(JSON.stringify(command)));
      return;
    }

    const pluginConnection = connections.find(c => c.plugin === plugin);

    if (!pluginConnection) {
      console.error('There is no connection with plugin: ', plugin);
      return;
    }

    pluginConnection.ws.send(JSON.stringify(command));
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
