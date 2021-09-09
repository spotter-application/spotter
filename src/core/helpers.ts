import { InputCommand, InputCommandType, OutputCommandType } from '@spotter-app/core';
import { History } from '../providers';
import { INTERNAL_PLUGIN_KEY } from './constants';
import {
  ExternalPluginOption,
  HandleCommandResult,
  InternalPluginLifecycle,
  InternalPluginOption,
  isInternalPlugin,
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
}

export const sortOptions = (
  options: Array<InternalPluginOption | ExternalPluginOption>,
  selectedOption: ExternalPluginOption | InternalPluginOption | null,
  history: History,
): Array<InternalPluginOption | ExternalPluginOption> => {
  return options.sort((a, b) => {
    return (history[getHistoryPath(b, selectedOption)] ?? 0) -
      (history[getHistoryPath(a, selectedOption)] ?? 0);
  });
}

export const handleCommands = (commands: PluginOutputCommand[]): HandleCommandResult => {
  return commands.reduce<HandleCommandResult>((acc, command) => {
    const handleCommandResult: HandleCommandResult = handleCommand(command);

    const optionsToRegister: RegisteredOptions | null = handleCommandResult.optionsToRegister
      ? {...(acc.optionsToRegister ?? {}), ...handleCommandResult.optionsToRegister}
      : acc.optionsToRegister;

    const optionsToSet: ExternalPluginOption[] | null = handleCommandResult.optionsToSet
      ? [...(acc.optionsToSet ?? []), ...handleCommandResult.optionsToSet]
      : acc.optionsToSet;

    return {
      optionsToRegister,
      optionsToSet,
      queryToSet: handleCommandResult.queryToSet ?? acc.queryToSet,
    };
  }, {
    optionsToRegister: null,
    optionsToSet: null,
    queryToSet: null,
  });
}

export const handleCommand = (command: PluginOutputCommand): HandleCommandResult => {
  const initialData: HandleCommandResult = {
    optionsToRegister: null,
    optionsToSet: null,
    queryToSet: null,
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

  return initialData;
}

export const triggerOnInitForPlugin = async (
  plugin: string | InternalPluginLifecycle,
  shell: SpotterShell,
): Promise<PluginOutputCommand[]> => {
  const command: InputCommand = {
    type: InputCommandType.onInit,
    storage: {},
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

  return new Promise<string>((resolve, reject) => {
    shell.execute(`${plugin} '${JSON.stringify(command)}'`)
      .then(resolve)
      .catch(reject)

    setTimeout(() => reject('timeout'), 5000);
  })
    .then(v => v ? v.split('\n').map(c => ({...(JSON.parse(c)), plugin})) : [])
    .catch(error => {
      // TODO: display the error
      const outputCommand: PluginOutputCommand = {
        type: OutputCommandType.setOptions,
        value: [{
          title: `Error in ${plugin}: ${error}`,
        }],
        plugin,
      };

      return [outputCommand];
    });
}
