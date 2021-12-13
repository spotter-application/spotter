import { Subject, filter, lastValueFrom, map, first } from 'rxjs';
import {
  SpotterOption,
  Command,
  CommandType,
  Settings,
  SpotterCommand,
  SpotterCommandType,
  Storage,
  OnQueryAction,
  ActionResult,
  ChannelForPlugin,
  PluginRegistryEntry,
  Action,
  ConnectPluginData,
  OnQueryOption,
  SpotterOnQueryOption,
  RegistryOption,
  SpotterRegistryOption,
} from './interfaces';
import { generateId } from './helpers';

const CHANNEL_ERROR = 'CHANNEL has not been passed/initialized.';

export class SpotterPlugin {
  private channel?: ChannelForPlugin;

  private getDataCommand = new Subject<{
    id: string,
    data: Settings | Storage<unknown> | PluginRegistryEntry[],
  }>();

  private actionsRegistry: {[id: string]: Action | OnQueryAction} = {};

  constructor(channel: Promise<ChannelForPlugin>) {
    this.init(channel);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onInit() {}

  // API
  private getSettings = (): Promise<Settings> => {
    const id = generateId();
    this.sendCommand(CommandType.getSettings, id);
    return this.reciveDataWithId<Settings>(id);
  }

  private patchSettings = (value: Partial<Settings>) => {
    this.sendCommand(CommandType.patchSettings, value);
  }

  private getStorage = <T>(): Promise<Storage<T>> => {
    const id = generateId();
    this.sendCommand(CommandType.getStorage, id);
    return this.reciveDataWithId<Storage<T>>(id);
  }

  private patchStorage = <T>(value: Partial<Storage<T>>) => {
    this.sendCommand(CommandType.patchStorage, value);
  }

  private setStorage = <T>(value: Storage<T>) => {
    this.sendCommand(CommandType.setStorage, value);
  }

  private setRegisteredOptions = (input: RegistryOption[]) => {
    const value = this.registredOptionsToSpotterRegistredOptions(input);
    this.sendCommand(CommandType.setRegisteredOptions, value);
  }

  private patchRegisteredOptions = (input: RegistryOption[]) => {
    const value = this.registredOptionsToSpotterRegistredOptions(input);
    this.sendCommand(CommandType.patchRegisteredOptions, value);
  }

  private setOnQueryOptions = (input: OnQueryOption[]) => {
    const value = this.onQueryOptionsToSpotterOnQueryOptions(input);
    this.sendCommand(CommandType.setOnQueryOptions, value);
  }

  private setPlaceholder = (value: string) => {
    this.sendCommand(CommandType.setPlaceholder, value);
  }

  private setQuery = (value: string) => {
    this.sendCommand(CommandType.setQuery, value);
  }

  private setError = (value: string) => {
    this.sendCommand(CommandType.setError, value);
  }

  private open = () => {
    this.sendCommand(CommandType.open);
  }

  private close = () => {
    this.sendCommand(CommandType.close);
  }

  private getPlugins = () => {
    const id = generateId();
    this.sendCommand(CommandType.getPlugins, id);
    return this.reciveDataWithId<PluginRegistryEntry[]>(id);
  }

  private addPlugin = (value: string) => {
    this.sendCommand(CommandType.addPlugin, value);
  }

  private connectPlugin = (value: ConnectPluginData) => {
    this.sendCommand(CommandType.connectPlugin, value);
  }

  private updatePlugin = (value: string) => {
    this.sendCommand(CommandType.updatePlugin, value);
  }

  private removePlugin = (value: string) => {
    this.sendCommand(CommandType.removePlugin, value);
  }

  private setTheme = (value: string) => {
    this.sendCommand(CommandType.setTheme, value);
  }

  readonly spotter = {
    getSettings: this.getSettings,
    patchSettings: this.patchSettings,
    getStorage: this.getStorage,
    setStorage: this.setStorage,
    patchStorage: this.patchStorage,
    setRegisteredOptions: this.setRegisteredOptions,
    patchRegisteredOptions: this.patchRegisteredOptions,
    setPlaceholder: this.setPlaceholder,
    setQuery: this.setQuery,
    setError: this.setError,
    open: this.open,
    close: this.close,
    plugins: {
      get: this.getPlugins,
      add: this.addPlugin,
      connect: this.connectPlugin,
      update: this.updatePlugin,
      remove: this.removePlugin,
    },
    setTheme: this.setTheme,
  }

  // Helpers
  private onQueryOptionsToSpotterOnQueryOptions(
    value: Array<OnQueryOption>,
  ): Array<SpotterOnQueryOption> {
    return value.map<OnQueryOption>(option => {
      let onSubmitId: string | null = null;
      let onHoverId: string | null = null;
      let onQueryId: string | null = null;
      let onQueryCancelId: string | null = null;

      if (option.onSubmit) {
        onSubmitId = generateId();
        this.actionsRegistry[onSubmitId] = option.onSubmit;
      }

      if (option.onHover) {
        onHoverId = generateId();
        this.actionsRegistry[onHoverId] = option.onHover;
      }

      if (option.onQuery) {
        onQueryId = generateId();
        this.actionsRegistry[onQueryId] = option.onQuery;
      }

      if (option.onQueryCancel) {
        onQueryCancelId = generateId();
        this.actionsRegistry[onQueryCancelId] = option.onQueryCancel;
      }

      return {
        title: option.title,
        subtitle: option.subtitle,
        onSubmitId,
        onHoverId,
        onQueryId,
        onQueryCancelId,
        icon: option.icon,
        replaceOptions: option.replaceOptions,
        hovered: option.hovered,
      };
    });
  }

  private registredOptionsToSpotterRegistredOptions(
    value: Array<RegistryOption>,
  ): Array<SpotterRegistryOption> {
    return value.map<RegistryOption>(option => {
      let onSubmitId: string | null = null;
      let onQueryId: string | null = null;
      let onQueryCancelId: string | null = null;

      if (option.onSubmit) {
        onSubmitId = generateId();
        this.actionsRegistry[onSubmitId] = option.onSubmit;
      }

      if (option.onQuery) {
        onQueryId = generateId();
        this.actionsRegistry[onQueryId] = option.onQuery;
      }

      if (option.onQueryCancel) {
        onQueryCancelId = generateId();
        this.actionsRegistry[onQueryCancelId] = option.onQueryCancel;
      }

      return {
        title: option.title,
        subtitle: option.subtitle,
        onSubmitId,
        onQueryId,
        onQueryCancelId,
        icon: option.icon,
        replaceOptions: option.replaceOptions,
        prefix: option.prefix,
      };
    });
  }

  private reciveDataWithId<T>(id: string): Promise<T> {
    return lastValueFrom(
      this.getDataCommand.pipe(
        filter(command => command.id === id),
        map(command => command.data),
        first(),
      ),
    ) as Promise<T>;
  }

  // function func(p1: TypeA, p2: ab): void;
  private sendCommand(type: CommandType.startPluginScript, value: string): void;
  private sendCommand(type: CommandType.close, value?: null): void;
  private sendCommand(type: CommandType.getPlugins, value: string): void;
  private sendCommand(type: CommandType.getSettings, value: string): void;
  private sendCommand(type: CommandType.getStorage, value: string): void;
  private sendCommand(type: CommandType.open, value?: null): void;
  private sendCommand(type: CommandType.patchSettings, value: Partial<Settings>): void;
  private sendCommand<T>(type: CommandType.patchStorage, value: Partial<Storage<T>>): void;
  private sendCommand(type: CommandType.setRegisteredOptions, value: SpotterOption[]): void;
  private sendCommand(type: CommandType.patchRegisteredOptions, value: SpotterOption[]): void;
  private sendCommand(type: CommandType.removePlugin, value: string): void;
  private sendCommand(type: CommandType.setError, value: string): void;
  private sendCommand(type: CommandType.setPlaceholder, value: string): void;
  private sendCommand(type: CommandType.setOnQueryOptions, value: SpotterOnQueryOption[]): void;
  private sendCommand(type: CommandType.setQuery, value: string): void;
  private sendCommand<T>(type: CommandType.setStorage, value: Storage<T>): void;
  private sendCommand(type: CommandType.addPlugin, value: string): void;
  private sendCommand(type: CommandType.connectPlugin, value: ConnectPluginData): void;
  private sendCommand(type: CommandType.updatePlugin, value: string): void;
  private sendCommand(type: CommandType.removePlugin, value: string): void;
  private sendCommand(type: CommandType.setTheme, value: string): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sendCommand(type: CommandType, value: any) {
    if (!this.channel) {
      console.error(CHANNEL_ERROR);
      return;
    }

    const command: Command = {
      type,
      value,
    };

    this.channel.sendToSpotter(JSON.stringify(command));
  }

  // Init plugin
  private async init(channel: Promise<ChannelForPlugin>) {
    this.channel = await channel;
    this.channel.onSpotter('message', async (data: string) => {
      const command: SpotterCommand = JSON.parse(data);

      if (command.type === SpotterCommandType.onInit) {
        this.onInit();
        return;
      }

      if (
        command.type === SpotterCommandType.onHover ||
        command.type === SpotterCommandType.onSubmit ||
        command.type === SpotterCommandType.onQuery ||
        command.type === SpotterCommandType.onQueryCancel
      ) {
        const actionId = command.type === SpotterCommandType.onHover
          ? command.onHoverId
          : command.type === SpotterCommandType.onSubmit
            ? command.onSubmitId
              : command.type === SpotterCommandType.onQuery
              ? command.onQueryId
                : command.type === SpotterCommandType.onQueryCancel
                  ? command.onQueryCancelId
                  : null;

        if (!actionId) {
          console.error('There is no action id.');
          return;
        }

        const action = this.actionsRegistry[actionId];

        if (!action) {
          console.error('There is no onQuery action in registry.');
          return;
        }

        const result: ActionResult = await action.bind(this)(
          command.type === SpotterCommandType.onQuery
            ? command.query
            : '',
        );

        if (Array.isArray(result)) {
          this.setOnQueryOptions(result);
          return;
        }

        if (typeof result === 'boolean' && !result) {
          return;
        }

        if (command.type !== SpotterCommandType.onHover) {
          this.close();
        }
        return;
      }

      if (
        command.type === SpotterCommandType.onGetSettings ||
        command.type === SpotterCommandType.onGetStorage ||
        command.type === SpotterCommandType.onGetPlugins
      ) {
        this.getDataCommand.next(command.value);
        return;
      }

      console.error('unknown command: ', command);
    });
  }
}
