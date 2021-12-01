import { PluginOption, PluginCommand, PluginCommandType, SpotterCommand, SpotterCommandType, PluginPrefix, SpotterOnGetStorageCommand, SpotterOnGetSettingsCommand } from '@spotter-app/core';
import React, { FC, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { BehaviorSubject, Subject, Observable, of, Subscription } from 'rxjs';
import { hideOptions, sortOptions } from '../helpers';
import { Connection } from '../interfaces';
import { useApi } from './api.provider';
import { useHistory } from './history.provider';
import { useSettings } from './settings.provider';
import { useSpotterState } from './state.provider';
import { useStorage } from './storage.provider';

type Context = {
  command$: Observable<PluginCommand>,
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
  } = useSpotterState();
  const { getSettings, patchSettings } = useSettings();
  const { getStorage, setStorage, patchStorage } = useStorage();
  const { getHistory } = useHistory();
  const { panel, xCallbackUrlApi, shell } = useApi();

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
    console.log('123');
    // const start = await shell.execute('forever start /Users/denis/Developer/spotter-core/dist/index.js');
    const start = await shell.execute('forever list').catch(() => false);

    console.log(start);


    xCallbackUrlApi.onCommand(handleCommand);
    subscriptions.push(commandRef.current.subscribe(handleCommand));
  };

  const handleCommand = async (command: PluginCommand) => {
    if (command.type === PluginCommandType.registerOptions) {
      setRegisteredOptions(prevOptions => {
        return command.value.reduce(
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

    if (command.type === PluginCommandType.registerPrefixes) {
      setRegisteredPrefixes(prevPrefixes => {
        return command.value.reduce(
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

    if (command.type === PluginCommandType.setOptions) {
      const history = await getHistory();
      const options = hideOptions(command.value);
      const sortedOptions = sortOptions(
        options,
        selectedOption,
        history,
      );

      panel.open();
      setOptions(sortedOptions);
      return;
    }

    if (command.type === PluginCommandType.setQuery) {
      setQuery(command.value);
      return;
    }

    if (command.type === PluginCommandType.setHint) {
      setHint(command.value);
      return;
    }

    if (command.type === PluginCommandType.setStorage) {
      setStorage(command.value);
      return;
    }

    if (command.type === PluginCommandType.getStorage) {
      const data = await getStorage();
      const cmd: SpotterOnGetStorageCommand = {
        type: SpotterCommandType.onGetStorage,
        value: {
          id: command.value,
          data,
        }
      };
      sendCommand(cmd);
    }

    if (command.type === PluginCommandType.patchStorage) {
      patchStorage(command.value);
    }

    if (command.type === PluginCommandType.patchSettings) {
      patchSettings(command.value);
    }

    if (command.type === PluginCommandType.getSettings) {
      console.log('GET SETTINGS');
      const data = await getSettings();
      const cmd: SpotterOnGetSettingsCommand = {
        type: SpotterCommandType.onGetSettings,
        value: {
          id: command.value,
          data,
        }
      };

      console.log(cmd)
      sendCommand(cmd);
    }

    if (command.type === PluginCommandType.setError) {
      Alert.alert(command.value)
    }

    if (command.type === PluginCommandType.connectPlugin) {
      if (!command.value.plugin) {
        Alert.alert('Please specify plugin name');
      }

      if (!command.value.port) {
        Alert.alert('Please specify plugin port');
      }

      if (!command.value.plugin || !command.value.port) {
        return;
      }

      connect(command.value.plugin, command.value.port);
    }
  }

  const connect = (plugin: string, port: number) => {
    const connections = connectionsRef.current.value;

    if (connections.find(c => c.port === port)) {
      console.log('Looks like port: `${port}` has been already occupied');
      return;
    }

    if (connections.find(c => c.plugin === plugin)) {
      console.log('Looks like plugin: `${plugin}` has been already connected');
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

    ws.onclose = () => {
      console.log('CLOSE');
      connectionsRef.current.next(
        connectionsRef.current.value.filter(c => c.plugin !== plugin),
      );
    };

    ws.onerror = e => {
      console.log(`Plugin with port ${port}: `, e);
      connectionsRef.current.next(
        connectionsRef.current.value.filter(c => c.plugin !== plugin),
      );
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
    console.log(connections);

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
