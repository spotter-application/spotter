import {
  CommandType,
  SpotterCommand,
  SpotterCommandType,
  SpotterOnGetStorageCommand,
  SpotterOnGetSettingsCommand,
  PluginRegistryEntry,
  SpotterOnGetPluginsCommand,
  ChannelForSpotter,
  randomPort,
  Command,
} from '@spotter-app/core';
import React, {FC, useEffect} from 'react';
import {Alert} from 'react-native';
import {Subject, Subscription, BehaviorSubject} from 'rxjs';
import {
  hideOptions,
  InternalPluginChannel,
  sortOptions,
  ExternalPluginChannel,
} from '../helpers';
import {
  ActivePlugin,
  PluginCommand,
  PluginOption,
  PluginPrefix,
} from '../interfaces';
import {INTERNAL_PLUGINS} from '../plugins';
import {useApi} from './api.provider';
import {useHistory} from './history.provider';
import {useSettings} from './settings.provider';
import {useSpotterState} from './state.provider';
import {useStorage} from './storage.provider';

const PLUGINS_STORAGE_KEY = 'PLUGINS_0.1-beta.5';

type Context = {
  sendCommand: (command: SpotterCommand, pluginName: string) => void;
};

const context: Context = {
  sendCommand: () => null,
};

export const PluginsContext = React.createContext<Context>(context);

export const PluginsProvider: FC = (props) => {
  const {
    registeredOptions$,
    registeredPrefixes$,
    selectedOption$,
    options$,
    query$,
    title$,
    displayedOptionsForCurrentWorkflow$,
    placeholder$,
    resetState,
  } = useSpotterState();

  const {getSettings, patchSettings} = useSettings();
  const {getStorage, setStorage, patchStorage} = useStorage();
  const {getHistory} = useHistory();
  const {panel, xCallbackUrlApi, shell, notifications, storage} = useApi();

  const command$ = new Subject<PluginCommand>();

  const activePlugins$ = new BehaviorSubject<ActivePlugin[]>([]);

  const subscriptions: Subscription[] = [];

  useEffect(() => {
    onInit();
  }, []);

  useEffect(() => {
    return () => {
      activePlugins$.value.forEach(({pid}) => stopPluginScript(pid));
      subscriptions.forEach((s) => s.unsubscribe());
    };
  }, []);

  const onInit = async () => {
    // Start plugins
    const plugins = await getPlugins();
    plugins.forEach((p) => startPluginScript(p.path));
    Object.keys(INTERNAL_PLUGINS).forEach((plugin) => {
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
      activePlugins$.next([...activePlugins$.value, nextActivePlugin]);
    });

    xCallbackUrlApi.onCommand(handleCommand);
    subscriptions.push(command$.subscribe(handleCommand));
  };

  const getPlugins: () => Promise<PluginRegistryEntry[]> = async () => {
    const plugins = await storage.getItem<PluginRegistryEntry[]>(
      PLUGINS_STORAGE_KEY,
    );
    return plugins ?? [];
  };

  const removePlugin: (pluginName: string) => void = async (pluginName) => {
    const plugins = await getPlugins();
    storage.setItem(
      PLUGINS_STORAGE_KEY,
      plugins.filter((p) => p.path !== pluginName),
    );
    removePluginRegistries(pluginName);
    const activePlugin = activePlugins$.value.find(
      (p) => p.name === pluginName,
    );
    if (activePlugin) {
      stopPluginScript(activePlugin.pid);
      activePlugins$.next(
        activePlugins$.value.filter((p) => p.name !== pluginName),
      );
    }
  };

  const removePluginRegistries = (pluginName: string) => {
    registeredOptions$.next(
      registeredOptions$.value.filter((o) => o.pluginName !== pluginName),
    );
    registeredPrefixes$.next(
      registeredPrefixes$.value.filter((o) => o.pluginName !== pluginName),
    );
  };

  const registerOptionsCommand = (
    command: PluginCommand & {type: CommandType.registerOptions},
  ) => {
    const nextRegisteredOptions = command.value
      .map((o) => ({...o, pluginName: command.pluginName}))
      .reduce((acc: PluginOption[], curr: PluginOption) => {
        const needsToBeReplaced = acc.find(
          (o: PluginOption) =>
            o.title === curr.title && o.pluginName === curr.pluginName,
        );

        if (needsToBeReplaced) {
          return acc.map((o) => {
            if (o.title === curr.title && o.pluginName === curr.pluginName) {
              return curr;
            }

            return o;
          });
        }

        return [...acc, curr];
      }, registeredOptions$.value);
    registeredOptions$.next(nextRegisteredOptions);
  };

  const registerPrefixesCommand = (
    command: PluginCommand & {type: CommandType.registerPrefixes},
  ) => {
    const nextRegisteredPrefixes = command.value
      .map((p) => ({...p, pluginName: command.pluginName}))
      .reduce((acc: PluginPrefix[], curr: PluginPrefix) => {
        const needsToBeReplaced = acc.find(
          (p: PluginPrefix) =>
            p.prefix === curr.prefix && p.pluginName === curr.pluginName,
        );

        if (needsToBeReplaced) {
          return acc.map((p) => {
            if (p.prefix === curr.prefix && p.pluginName === curr.pluginName) {
              return curr;
            }

            return p;
          });
        }

        return [...acc, curr];
      }, registeredPrefixes$.value);
    registeredPrefixes$.next(nextRegisteredPrefixes);
  };

  const setOptionsCommand = async (
    command: PluginCommand & {type: CommandType.setOptions},
  ) => {
    const history = await getHistory();
    const options = hideOptions(
      command.value.map((o) => ({...o, pluginName: command.pluginName})),
    );
    const sortedOptions = sortOptions(options, selectedOption$.value, history);

    panel.open();
    options$.next(sortedOptions);
    if (sortedOptions.length) {
      displayedOptionsForCurrentWorkflow$.next(true);
    }
  };

  const getStorageCommand = async (
    command: PluginCommand & {type: CommandType.getStorage},
  ) => {
    const data = await getStorage(command.pluginName);
    const cmd: SpotterOnGetStorageCommand = {
      type: SpotterCommandType.onGetStorage,
      value: {
        id: command.value,
        data,
      },
    };
    sendCommand(cmd, command.pluginName);
  };

  const getSettingsCommand = async (
    command: PluginCommand & {type: CommandType.getSettings},
  ) => {
    const data = await getSettings();
    const cmd: SpotterOnGetSettingsCommand = {
      type: SpotterCommandType.onGetSettings,
      value: {
        id: command.value,
        data,
      },
    };
    sendCommand(cmd, command.pluginName);
  };

  const getPluginsCommand = async (
    command: PluginCommand & {type: CommandType.getPlugins},
  ) => {
    const data = await getPlugins();
    const cmd: SpotterOnGetPluginsCommand = {
      type: SpotterCommandType.onGetPlugins,
      value: {
        id: command.value,
        data,
      },
    };
    sendCommand(cmd, command.pluginName);
  };

  const connectPluginCommand = async (
    command: PluginCommand & {type: CommandType.connectPlugin},
  ) => {
    // TODO: check if plugin doesn't have a uniq name
    // Otherwise there will be a conflict when setting data to storage
    const activePlugin = activePlugins$.value.find(
      (p) => p.name === command.value.name,
    );

    if (activePlugin) {
      stopPluginScript(activePlugin.pid);
      removePluginRegistries(activePlugin.path);
      activePlugins$.next(
        activePlugins$.value.filter((p) => p.name !== activePlugin.name),
      );
    }

    const plugins = await getPlugins();
    const registryEntry = plugins.find((p) => p.path === command.value.path);

    const isInternalPlugin = !command.value.pid;
    const isDevelopment = command.value.name === command.value.path;

    if (!registryEntry && !isInternalPlugin && !isDevelopment) {
      storage.setItem(PLUGINS_STORAGE_KEY, [
        ...plugins,
        {name: command.value.name, path: command.value.path},
      ]);
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
    };

    listenPlugin(plugin);

    activePlugins$.next([...activePlugins$.value, plugin]);
  };

  const handleCommand = async (command: PluginCommand) => {
    if (command.type === CommandType.registerOptions) {
      registerOptionsCommand(command);
      return;
    }

    if (command.type === CommandType.registerPrefixes) {
      registerPrefixesCommand(command);
      return;
    }

    if (command.type === CommandType.setOptions) {
      setOptionsCommand(command);
      return;
    }

    if (command.type === CommandType.setTitle) {
      title$.next(command.value);
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
      Alert.alert(command.value ?? `${command.pluginName} error...`);
      return;
    }

    if (command.type === CommandType.startPluginScript) {
      startPluginScript(command.value);
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

    if (command.type === CommandType.open) {
      panel.open();
      return;
    }

    if (command.type === CommandType.close) {
      panel.close();
      resetState();
      return;
    }
  };

  const startPluginScript = async (pluginPath: string): Promise<string> => {
    const activePlugin = activePlugins$.value.find(
      (p) => p.path === pluginPath,
    );

    if (activePlugin) {
      await stopPluginScript(activePlugin.pid);
    }

    const port = randomPort();

    return shell.execute(
      `nohup node ${pluginPath} ${port} ${pluginPath} > /dev/null 2>&1 &`,
    );
  };

  const stopPluginScript = async (pid: number) => {
    shell.execute(`kill ${pid} || echo 'Process was not running.'`);
  };

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
  };

  const listenPlugin = (plugin: ActivePlugin) => {
    plugin.channel.onPlugin('open', async () => {
      const onInitCommand: SpotterCommand = {
        type: SpotterCommandType.onInit,
      };
      plugin.channel.sendToPlugin(JSON.stringify(onInitCommand));
    });

    let error: string | null = null;

    plugin.channel.onPlugin('error', (message) => {
      error = message;
      notifications.show('Error', `Plugin ${plugin}: ${error}`);
      removePlugin(plugin.path);
    });

    plugin.channel.onPlugin('close', () => {
      stopPluginScript(plugin.pid);
      removePluginRegistries(plugin.path);
    });

    plugin.channel.onPlugin('message', (data) => {
      const command: Command = JSON.parse(data);
      command$.next({...command, pluginName: plugin.name});
    });
  };

  const sendCommand = (command: SpotterCommand, pluginName: string) => {
    const plugin = activePlugins$.value.find((p) => p.name === pluginName);

    if (!plugin) {
      console.error('There is no connection with plugin: ', plugin);
      return;
    }

    plugin.channel.sendToPlugin(JSON.stringify(command));
  };

  return (
    <PluginsContext.Provider
      value={{
        ...context,
        sendCommand,
      }}>
      {props.children}
    </PluginsContext.Provider>
  );
};

export const usePlugins = () => React.useContext(PluginsContext);
