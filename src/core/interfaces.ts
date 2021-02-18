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

// TODO: Rename
export type SpotterCallbackOptions = {
  [pluginIdentifier: string]: SpotterOptionBase[] | null,
}

export type SpotterQueryCallback = (query: string, options: SpotterCallbackOptions) => void;

export declare abstract class SpotterPluginsRegistry {
  abstract register(plugins: SpotterPluginConstructor[]): void;
  abstract onOpenSpotter(): void;
  abstract destroyPlugins(): void;
  abstract findOptionsForQuery(
    query: string,
    callback: SpotterQueryCallback,
  ): void;
  // abstract options: {[plugin: string]: SpotterOptionBase[]};
  abstract list: {[pluginId: string]: SpotterPluginLifecycle};
}

export declare abstract class SpotterSettingsRegistry {
  abstract getSettings(): Promise<SpotterSettings>;
  abstract patchSettings(settings: Partial<SpotterSettings>): Promise<void>;
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
  abstract register(hotkey: SpotterHotkey | null, identifier: string): void;
  abstract onPress(callback: (event: { hotkey: SpotterHotkey, identifier: string }) => void): void;
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

export declare type SpotterAction = () => any | Promise<any>;

export type SpotterOptionBaseImage = string | number | undefined;

export interface SpotterOptionBase {
  title: string;
  action: SpotterAction;
  subtitle?: string;
  keywords?: string[];
  icon?: SpotterOptionBaseImage;
}

export type SpotterOption = SpotterOptionBase & {
  plugin: string;
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

  public identifier: string;

  abstract onQuery(query: string): SpotterOptionBase[] | Promise<SpotterOptionBase[]>;

  public options?: SpotterOptionBase[];

  abstract onInit?(): void;

  abstract onOpenSpotter?(): void;

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

export type SpotterPluginHotkeys = {
  [plugin: string]: { [option: string]: SpotterHotkey | null };
}

export interface SpotterSettings {
  hotkey: SpotterHotkey | null;
  pluginHotkeys: SpotterPluginHotkeys;
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

export interface SpotterThemeColors {
  background: string,
  border: string,
  text: string,
  description: string,
  active: {
    background: string,
    border: string,
    text: string,
    description: string,
  },
}

export interface Application {
  title: string,
  path: string,
}
