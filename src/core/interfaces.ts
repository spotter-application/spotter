import {
  Hotkey,
  Option,
  OutputCommand,
  Settings,
  Storage,
} from '@spotter-app/core';

export interface SpotterApi {
  storage: SpotterStorageApi,
  hotkey: SpotterHotkeyApi,
  notifications: SpotterNotificationsApi,
  statusBar: SpotterStatusBarApi,
  shell: SpotterShellApi,
  panel: SpotterPanelApi,
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

export declare abstract class SpotterStorageApi {
  abstract setItem<T>(key: string, value: T): Promise<void>
  abstract getItem<T>(key: string): Promise<T | null>
}

export interface PluginOption extends Option {
  plugin: string;
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

export type PluginOutputCommand = OutputCommand & {
  plugin: string;
}

export interface RegisteredOptions {
  [plugin: string]: PluginOption[],
}

export interface ParseCommandsResult {
  optionsToRegister: null | RegisteredOptions,
  optionsToSet: null | PluginOption[],
  queryToSet: null | string,
  hintToSet: null | string,
  storageToSet: null | Storage,
  storageToPatch: null | Partial<Storage>,
  settingsToPatch: null | Partial<Settings>,
  prefixesToRegister: null | RegisteredPrefixes,
  errorsToSet: null | string[],
  logs: null | string[],
}

export interface RegisteredPrefixes {
  [plugin: string]: string[],
}
