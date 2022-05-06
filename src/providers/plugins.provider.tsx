import {
  CommandType,
  SpotterCommand,
  SpotterCommandType,
  SpotterOnGetStorageCommand,
  SpotterOnGetSettingsCommand,
  SpotterOnGetPluginsCommand,
  ChannelForSpotter,
  Command,
  Plugin,
} from '@spotter-app/core';
import React, { FC, PropsWithChildren, useEffect } from 'react';
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
  sendCommand: (command: SpotterCommand, port: number) => void,
};

const context: Context = {
  sendCommand: () => null,
}

export const PluginsContext = React.createContext<Context>(context);

export const PluginsProvider: FC<{}> = (props: PropsWithChildren<{}>) => {

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

  // TODO: rename to plugin channels
  const activePlugins$ = new BehaviorSubject<ActivePlugin[]>([]);

  const subscriptions: Subscription[] = [];

  useEffect(() => {
    onInit();
  }, []);

  useEffect(() => {
    return () => {
      activePlugins$.value.forEach(({ port }) => killPort(port))
      subscriptions.forEach(s => s.unsubscribe())
    };
  }, []);

  const onInit = async () => {
    // Start plugins
    const plugins = await getPlugins();
    plugins.forEach(p => restartPlugin(p.path, p.port));
    Object.keys(INTERNAL_PLUGINS).forEach(port => {
      const channel = getPluginChannel(parseInt(port));
      if (!channel) {
        console.error('Error.');
        return;
      }
      const nextActivePlugin: ActivePlugin = {
        name: '',
        versionName: '',
        publishedAt: '',
        path: '',
        channel,
        port: parseInt(port),
        connected: true,
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

  const getPlugins: () => Promise<Plugin[]> = async () => {
    const plugins = await storage.getItem<Plugin[]>(PLUGINS_STORAGE_KEY);
    return plugins?.map(p => ({...p, connected: !!activePlugins$.value.find(ap => ap.port == p.port)})) ?? [];
  }

  const addPlugin: (
    plugin: Plugin,
  ) => void = async (plugin) => {
    const plugins = await getPlugins();
    const alreadyRegistered = plugins.find(p => p.port === plugin.port);

    if (alreadyRegistered) {
      notifications.show('Error', 'Plugin already registered.');
      return;
    }

    storage.setItem(PLUGINS_STORAGE_KEY, [...plugins, plugin]);

    restartPlugin(plugin.path, plugin.port);
  }

  const removePlugin: (
    port: number,
  ) => void = async (port) => {
    const plugins = await getPlugins();
    storage.setItem(PLUGINS_STORAGE_KEY, plugins.filter(p => p.port !== port));
    removePluginRegistries(port);
    const activePlugin = activePlugins$.value.find(p =>
      p.port=== port,
    );
    if (activePlugin) {
      activePlugins$.next(activePlugins$.value.filter(p =>
        p.port !== port,
      ));
    }
    killPort(port);
  }

  const removePluginRegistries = (
    port: number,
  ) => {
    registeredOptions$.next(
      registeredOptions$.value.filter(o => o.port !== port),
    );
  }

  const setRegisteredOptionsCommand = (
    command: (PluginCommand & {type: CommandType.setRegisteredOptions})
  ) => {
    const nextRegisteredOptions = command.value
    .map(o => ({...o, port: command.port}))
    .reduce(
      (acc: PluginRegistryOption[], curr: PluginRegistryOption) => {
        const needsToBeReplaced = acc.find((o: PluginRegistryOption) =>
          o.title === curr.title && o.port === curr.port,
        );

        if (needsToBeReplaced) {
          return acc.map(o => {
            if (o.title === curr.title && o.port === curr.port) {
              return curr;
            }

            return o;
          });
        }

        return [...acc, curr];
      },
      registeredOptions$.value.filter(o => o.port !== command.port),
    );
    registeredOptions$.next(nextRegisteredOptions);
  }

  const patchRegisteredOptionsCommand = (
    command: (PluginCommand & {type: CommandType.patchRegisteredOptions})
  ) => {
    const nextRegisteredOptions = command.value
    .map(o => ({...o, port: command.port}))
    .reduce(
      (acc: PluginRegistryOption[], curr: PluginRegistryOption) => {
        const needsToBeReplaced = acc.find((o: PluginRegistryOption) =>
          o.title === curr.title && o.port === curr.port,
        );

        if (needsToBeReplaced) {
          return acc.map(o => {
            if (o.title === curr.title && o.port === curr.port) {
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
      command.value.map(o => ({...o, port: command.port}))
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
    const data = await getStorage(command.port);
    const cmd: SpotterOnGetStorageCommand = {
      type: SpotterCommandType.onGetStorage,
      value: {
        id: command.value,
        data,
      }
    };
    sendCommand(cmd, command.port);
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
    sendCommand(cmd, command.port);
  }

  const getPluginsCommand = async (
    command: (PluginCommand & {type: CommandType.getPlugins})
  ) => {
    const plugins = await getPlugins();

    const cmd: SpotterOnGetPluginsCommand = {
      type: SpotterCommandType.onGetPlugins,
      value: {
        id: command.value,
        data: plugins,
      }
    };

    sendCommand(cmd, command.port);
  }

  const pluginStartedCommand = async (
    command: (PluginCommand & {type: CommandType.pluginStarted})
  ) => {
    const plugins = await getPlugins();

    const channel: ChannelForSpotter | null = getPluginChannel(command.port);

    if (!channel) {
      console.error('Error');
      return;
    }

    const registeredPlugin: Plugin | undefined = plugins.find(p => p.port === command.port);

    const activePlugin: ActivePlugin = {
      ...registeredPlugin as Plugin,
      channel,
    }

    listenPlugin(activePlugin);

    if (!registeredPlugin) {
      notifications.show('Connected', 'Plugin has been connected with dev mode');
    }

    activePlugins$.next([
      ...activePlugins$.value,
      activePlugin,
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
      setStorage(command.value, command.port);
      return;
    }

    if (command.type === CommandType.getStorage) {
      getStorageCommand(command);
      return;
    }

    if (command.type === CommandType.patchStorage) {
      patchStorage(command.value, command.port);
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

    if (command.type === CommandType.startPlugin) {
      restartPlugin(command.value.path, command.value.port);
      return;
    }

    if (command.type === CommandType.pluginStarted) {
      pluginStartedCommand(command);
      return;
    }

    if (command.type === CommandType.addPlugin) {
      addPlugin(command.value);
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

  const restartPlugin = async (
    path: string,
    port: number,
  ): Promise<string> => {
    await killPort(port);
    return await shell.execute(`nohup ${path} ${port} > /dev/null 2>&1 &`);
  }


  const killPort = async (
    port: number,
  ) => {
    return await shell.execute(`lsof -n -i:${port} | grep LISTEN | awk '{ print $2 }' | xargs kill`);
  }

  const getPluginChannel = (port: number): ChannelForSpotter | null => {
    const isInternalPort = Object.keys(INTERNAL_PLUGINS).find(p => parseInt(p) === port);
    if (isInternalPort) {
      return new InternalPluginChannel(port);
    }

    return new ExternalPluginChannel(port);
  }

  const listenPlugin = (plugin: ActivePlugin) => {
    if (!plugin.channel) {
      return;
    }

    plugin.channel.onPlugin('open', async () => {
      const onInitCommand: SpotterCommand = {
        type: SpotterCommandType.onInit,
      };
      if (!plugin.channel) {
        return;
      }
      plugin.channel.sendToPlugin(JSON.stringify(onInitCommand));
    });

    plugin.channel.onPlugin('error', () => {
      const activePlugin = activePlugins$.value.find(p =>
        p.port === plugin.port,
      );
      if (!activePlugin) {
        return;
      }
      killPort(plugin.port);
      removePluginRegistries(plugin.port);
      activePlugins$.next(
        activePlugins$.value.filter(p => p.port !== plugin.port),
      );
    });

    plugin.channel.onPlugin('close', () => {
      const activePlugin = activePlugins$.value.find(p =>
        p.port === plugin.port,
      );
      if (!activePlugin) {
        return;
      }
      killPort(plugin.port);
      removePluginRegistries(plugin.port);
      activePlugins$.next(
        activePlugins$.value.filter(p => p.port !== plugin.port),
      );
    });

    plugin.channel.onPlugin('message', data => {
      const command: Command = JSON.parse(data);
      command$.next({...command, port: plugin.port});
    });
  }

  const sendCommand = (command: SpotterCommand, port: number) => {
    const plugin = activePlugins$.value.find(p => p.port === port);

    if (!plugin || !plugin.channel) {
      console.error('There is no connection with plugin on port: ', port);
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
