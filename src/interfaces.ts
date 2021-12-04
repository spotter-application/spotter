import {
  Hotkey,
  Command,
  Prefix,
  Option,
  ChannelForSpotter,
} from '@spotter-app/core';
 
export type PluginCommand = Command & {
  plugin: string,
}

export type PluginOption = Option & {
  plugin: string,
}

export type PluginPrefix = Prefix & {
  plugin: string,
}

export declare abstract class SpotterShellApi {
  abstract execute(command: string): Promise<string>;
}

export declare abstract class SpotterStatusBarApi {
  abstract changeTitle(title: string): void;
}

export declare abstract class SpotterPanelApi {
  abstract toggle(): void;
  abstract open(): void;
  abstract close(): void;
  abstract openSettings(): void;
}

export declare abstract class SpotterNotificationsApi {
  abstract show(title: string, subtitle: string): void;
}

export declare abstract class SpotterHotkeyApi {
  abstract register(hotkey: Hotkey | null, identifier: string): void;
  abstract onPress(callback: (event: { hotkey: Hotkey, identifier: string }) => void): void;
}

export declare abstract class SpotterXCallbackUrlApi {
  abstract onCommand(callback: (event: PluginCommand) => void): void;
}

export declare abstract class SpotterStorageApi {
  abstract setItem<T>(key: string, value: T): Promise<void>
  abstract getItem<T>(key: string): Promise<T | null>
}

// TODO: check
export interface SpotterThemeColors {
  background: string,
  highlight: string,
  text: string,
  description: string,
  active: {
    background: string,
    highlight: string,
    text: string,
    description: string,
  },
}

export interface SpotterHotkeyEvent {
  hotkey: Hotkey,
  identifier: string,
}


export type Connection = {
  plugin: string,
  port: number,
  channel: ChannelForSpotter,
}
