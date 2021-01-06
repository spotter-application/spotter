export interface SpotterNativeModules {
  storage: SpotterStorage,
  globalHotKey: SpotterGlobalHotkey,
  notifications: SpotterNotifications,
  statusBar: SpotterStatusBar,
  clipboard: SpotterClipboard,
  shell: SpotterShell,
  appsDimensions: SpotterAppsDimensions,
  panel: SpotterPanel,
  bluetooth: SpotterBluetooth,
}

export interface SpotterRegistries {
  plugins: SpotterPluginsRegistry,
  settings: SpotterSettingsRegistry,
  history: SpotterHistoryRegistry,
}

export declare abstract class SpotterPluginsRegistry {
  abstract register(plugins: SpotterPluginConstructor[]): void;
  abstract destroy(): void;
  abstract findOptionsForQuery(query: string, callback: (options: SpotterOption[]) => void): void;
}

export declare abstract class SpotterSettingsRegistry {
  abstract getSettings(): Promise<SpotterSettings>;
  abstract patchSettings(settings: Partial<SpotterSettings>): void;
}

export declare abstract class SpotterHistoryRegistry {
  abstract getHistory(): Promise<SpotterHistory>;
  abstract increaseHistoryItem(query: string): void;
}

export declare abstract class SpotterShell {
  abstract execute(command: string): Promise<string>;
}

export declare abstract class SpotterBluetooth {
  abstract getDevices(): Promise<SpotterBluetoothItem[]>;
  abstract connectDevice(address: string): void;
  abstract disconnectDevice(address: string): void;
}

export declare abstract class SpotterClipboard {
  abstract setValue(value: string): void;
  abstract getValue(): Promise<string>;
}

export declare abstract class SpotterStatusBar {
  abstract changeTitle(title: string): void;
}

export declare abstract class SpotterPanel {
  abstract toggle(): void;
  abstract open(): void;
  abstract close(): void;
  abstract openSettings(): void;
}

export declare abstract class SpotterNotifications {
  abstract show(title: string, subtitle: string): void;
}

export declare abstract class SpotterGlobalHotkey {
  abstract register(hotkey: SpotterHotkey | null): void;
  abstract onPress(callback: (option: SpotterActionId) => void): void;
}

export declare abstract class SpotterAppsDimensions {
  abstract setValue(appName: string, x: number, y: number, width: number, height: number): void;
  abstract getValue(): Promise<SystemApplicationDimensions[]>;
}

export declare abstract class SpotterStorage {
  abstract setItem<T>(key: string, value: T): Promise<void>
  abstract getItem<T>(key: string): Promise<T | null>
}

/* Base interfaces */

export declare type SpotterActionId = string;

export declare type SpotterAction = () => void | Promise<boolean>;

export type SpotterOptionImage = string | number;

export interface SpotterOption {
  title: string;
  action: SpotterAction;
  subtitle?: string;
  image?: SpotterOptionImage;
}

export interface SystemApplication {
  title: string;
  path: string;
  icon: string;
}

export interface SystemApplicationDimensions {
  appName: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export declare abstract class SpotterPluginLifecycle {

  abstract onInit?(): void;

  abstract onQuery(query: string): SpotterOption[] | Promise<SpotterOption[]>;

  abstract onDestroy?(): void;

}

export interface SpotterPluginConstructor {
  new(nativeModules: SpotterNativeModules): SpotterPluginLifecycle;
}

export interface SpotterHotkey {
  keyCode: number;
  modifiers: number;
  doubledModifiers: boolean;
}

export interface SpotterSettings {
  hotkey: SpotterHotkey | null;
}

export type SpotterHistoryExecutionsTotal = number;

export type SpotterHistory = {
  [optionTitle: string]: SpotterHistoryExecutionsTotal;
}

export interface SpotterBluetoothItem {
  name: string,
  connected: boolean,
  paired: boolean,
  address: string,
}
