import { InputCommand, InputCommandType, OutputCommandType, Storage } from '@spotter-app/core';
import { RegisteredPrefixes } from '.';
import { History } from '../providers';
import { INTERNAL_PLUGIN_KEY } from './constants';
import {
  ExternalPluginOption,
  HandleCommandResult,
  InternalPluginLifecycle,
  InternalPluginOption,
  isExternalPluginOption,
  isInternalPlugin,
  Options,
  PluginOutputCommand,
  RegisteredOptions,
  SpotterShell,
} from './interfaces';

export const getHistoryPath = (
  option: ExternalPluginOption | InternalPluginOption,
  selectedOption: ExternalPluginOption | InternalPluginOption | null,
): string => {
  const path = selectedOption
    ? `${option.plugin}:${selectedOption.title}#${option.title}`
    : `${option.plugin}:${option.title}`;

  return path;
};

export const sortOptions = (
  options: Array<InternalPluginOption | ExternalPluginOption>,
  selectedOption: ExternalPluginOption | InternalPluginOption | null,
  history: History,
): Array<InternalPluginOption | ExternalPluginOption> => {
  return options.sort((a, b) => {
    return (history[getHistoryPath(b, selectedOption)] ?? 0) -
      (history[getHistoryPath(a, selectedOption)] ?? 0);
  });
};

export const handleCommands = (commands: PluginOutputCommand[]): HandleCommandResult => {
  return commands.reduce<HandleCommandResult>((acc, command) => {
    const handleCommandResult: HandleCommandResult = handleCommand(command);

    const optionsToRegister: RegisteredOptions | null = handleCommandResult.optionsToRegister
      ? {...(acc.optionsToRegister ?? {}), ...handleCommandResult.optionsToRegister}
      : acc.optionsToRegister;

    const optionsToSet: ExternalPluginOption[] | null = handleCommandResult.optionsToSet
      ? [...(acc.optionsToSet ?? []), ...handleCommandResult.optionsToSet]
      : acc.optionsToSet;

    const dataToStorage: Storage | null = handleCommandResult.dataToStorage
      ? {...(acc.dataToStorage ?? {}), ...handleCommandResult.dataToStorage}
      : acc.dataToStorage;

      const prefixesToRegister: RegisteredPrefixes | null = handleCommandResult.prefixesToRegister
      ? {...(acc.prefixesToRegister ?? {}), ...handleCommandResult.prefixesToRegister}
      : acc.prefixesToRegister;

    const errorsToSet: string[] | null = handleCommandResult.errorsToSet
      ? [...(acc.errorsToSet ?? []), ...handleCommandResult.errorsToSet]
      : acc.errorsToSet;

    return {
      optionsToRegister,
      optionsToSet,
      queryToSet: handleCommandResult.queryToSet ?? acc.queryToSet,
      dataToStorage,
      prefixesToRegister,
      errorsToSet,
    };
  }, {
    optionsToRegister: null,
    optionsToSet: null,
    queryToSet: null,
    dataToStorage: null,
    prefixesToRegister: null,
    errorsToSet: null,
  });
};

export const handleCommand = (command: PluginOutputCommand): HandleCommandResult => {
  const initialData: HandleCommandResult = {
    optionsToRegister: null,
    optionsToSet: null,
    queryToSet: null,
    dataToStorage: null,
    prefixesToRegister: null,
    errorsToSet: null,
  };

  if (command.type === OutputCommandType.registerOptions) {
    return {
      ...initialData,
      optionsToRegister: {
        [command.plugin]: command.value.map(o =>
          ({ ...o, plugin: command.plugin })
        ),
      }
    };
  }

  if (command.type === OutputCommandType.setOptions) {
    return {
      ...initialData,
      optionsToSet: command.value.map(o => ({...o, plugin: command.plugin})),
    };
  }

  if (command.type === OutputCommandType.setQuery) {
    return {
      ...initialData,
      queryToSet: command.value,
    };
  }

  if (command.type === OutputCommandType.setStorage) {
    return {
      ...initialData,
      dataToStorage: {
        [command.plugin]: command.value,
      }
    };
  }

  if (command.type === OutputCommandType.registerPrefixes) {
    return {
      ...initialData,
      prefixesToRegister: {
        [command.plugin]: command.value,
      }
    };
  }

  if (command.type === OutputCommandType.setErrors) {
    return {
      ...initialData,
      errorsToSet: command.value,
    };
  }

  return initialData;
};

export const onQueryInternalPluginAction = async (
  option: InternalPluginOption,
  query: string
): Promise<PluginOutputCommand[]> => {
  if (!option || !option.queryAction) {
    return [];
  }

  const options = await option.queryAction(query);

  return [{
    type: OutputCommandType.setOptions,
    plugin: option.plugin,
    value: options,
  }];
};

export const onPrefixes  = async (
  prefixes: string[],
  query: string,
  plugin: string,
  shell: SpotterShell,
  storage: Storage,
): Promise<PluginOutputCommand[]> => {
  return await prefixes.reduce<Promise<PluginOutputCommand[]>>(
    async (asyncAcc, prefix) => {
      return [
        ...(await asyncAcc),
        ...(await onPrefix(
          prefix,
          query,
          plugin,
          shell,
          storage,
        )),
      ];
    },
    Promise.resolve([]),
  );
};

export const onPrefix = async (
  prefix: string,
  query: string,
  plugin: string,
  shell: SpotterShell,
  storage: Storage,
): Promise<PluginOutputCommand[]> => {
  const command: InputCommand = {
    type: InputCommandType.onPrefix,
    prefix,
    storage,
    query
  };

  return await triggerExternalPluginCommand(plugin, command, shell);
};

export const onPrefixForPlugins = async (
  registeredPrefixes: RegisteredPrefixes,
  query: string,
  shell: SpotterShell,
  storage: Storage,
): Promise<PluginOutputCommand[]> => {
  return await Object.entries(registeredPrefixes).reduce<Promise<PluginOutputCommand[]>>(
    async (asyncAcc, [plugin, prefixes]) => {
      return [
        ...(await asyncAcc),
        ...(await onPrefixes(
          prefixes,
          query,
          plugin,
          shell,
          storage,
        )),
      ];
    },
    Promise.resolve([]),
  );
};

export const onQueryExternalPluginAction = async (
  option: ExternalPluginOption,
  query: string,
  shell: SpotterShell,
  storage: Storage,
): Promise<PluginOutputCommand[]> => {
  if (!option?.queryAction) {
    return [];
  }

  const command: InputCommand = {
    type: InputCommandType.onQueryAction,
    queryAction: option.queryAction,
    storage,
    query
  };

  return await triggerExternalPluginCommand(option.plugin, command, shell);
};

export const checkForPluginPrefixesToRegister = async (
  plugin: string,
  shell: SpotterShell,
): Promise<PluginOutputCommand[]> => {
  const command: InputCommand = {
    type: InputCommandType.checkForOnPrefixMethods,
  };

  return await triggerExternalPluginCommand(plugin, command, shell);
};

export const checkForPluginsPrefixesToRegister  = async (
  plugins: string[],
  shell: SpotterShell,
): Promise<PluginOutputCommand[]> => {
  return await plugins.reduce<Promise<PluginOutputCommand[]>>(
    async (asyncAcc, plugin) => {
      return [
        ...(await asyncAcc),
        ...(await checkForPluginPrefixesToRegister(
          plugin,
          shell,
        )),
      ];
    },
    Promise.resolve([]),
  );
};

export const checkForOptionsToRegister = async (
  plugin: string,
  shell: SpotterShell,
): Promise<PluginOutputCommand[]> => {
  const command: InputCommand = {
    type: InputCommandType.checkForOptionsToRegister,
  };

  return await triggerExternalPluginCommand(plugin, command, shell);
};

export const triggerOnInitForInternalAndExternalPlugins = async (
  plugins: Array<InternalPluginLifecycle | string>,
  shell: SpotterShell,
  storage: Storage,
): Promise<PluginOutputCommand[]> => {
  return await plugins.reduce<Promise<PluginOutputCommand[]>>(
    async (asyncAcc, plugin) => {
      return [
        ...(await asyncAcc),
        ...(await triggerOnInitForInternalOrExternalPlugin(
          plugin,
          shell,
          storage[typeof plugin === 'string' ? plugin : INTERNAL_PLUGIN_KEY] ?? {},
        )),
      ]
    },
    Promise.resolve([]),
  );
};

export const triggerOnInitForInternalOrExternalPlugin = async (
  plugin: string | InternalPluginLifecycle,
  shell: SpotterShell,
  storage: Storage,
): Promise<PluginOutputCommand[]> => {
  const command: InputCommand = {
    type: InputCommandType.onInit,
    storage,
  };

  if (isInternalPlugin(plugin)) {
    if (!plugin?.onInit) {
      return [];
    }

    const outputCommand: PluginOutputCommand = {
      type: OutputCommandType.registerOptions,
      value: await plugin.onInit() ?? [],
      plugin: INTERNAL_PLUGIN_KEY,
    };
    return Promise.resolve([outputCommand]);
  }

  return await triggerExternalPluginCommand(plugin, command, shell);
};

const triggerExternalPluginCommand = async (
  plugin: string,
  command: InputCommand,
  shell: SpotterShell,
): Promise<PluginOutputCommand[]> => {
  try {
    const localPluginPath = isLocalPluginPath(plugin);
    const v = await new Promise<string>((resolve, reject) => {
      shell.execute(`${localPluginPath ? 'node ' : ''}${plugin} '${JSON.stringify(command)}'`)
        .then(resolve)
        .catch(reject);

      setTimeout(() => reject('timeout'), 5000);
    });
    return v ? v.split('\n').map(c => ({ ...(JSON.parse(c)), plugin })) : [];
  } catch (error) {
    // TODO: display the error
    const outputCommand: PluginOutputCommand = {
      type: OutputCommandType.setErrors,
      value: [error as string],
      plugin,
    };
    return [outputCommand];
  }
};

export const forceReplaceOptions = (options: Options): Options => {
  const optionsWithForceReplace: ExternalPluginOption[] = options.filter(
    o => isExternalPluginOption(o) && o.forceReplaceOption
  );
  if (!optionsWithForceReplace.length) {
    return options;
  }

  return [...options.filter(option => optionsWithForceReplace.find(
    o => o.forceReplaceOption !== option.title
  )), ...optionsWithForceReplace];
};

export const isLocalPluginPath = (path: string): boolean => {
  return RegExp('^(.+)\/([^\/]+)$').test(path);
}
