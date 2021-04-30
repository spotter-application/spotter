import { Observable } from 'rxjs';

/*
* TODO:
*
* implement exec function instead of multiple api instances
*   eg:
*   exec('SHELL', 'shell_command')
*   exec('NOTIFICATION', 'notification_text')
* */
export interface SpotterApi {
  storage: SpotterStorage,
  globalHotKey: SpotterGlobalHotkey,
  notifications: SpotterNotifications,
  statusBar: SpotterStatusBar,
  clipboard: SpotterClipboard,
  shell: SpotterShell,
  applications: SpotterApplicationsNative,
  panel: SpotterPanel,
  bluetooth: SpotterBluetooth,
}

export interface SpotterRegistries {
  plugins: SpotterPluginsRegistry,
  settings: SpotterSettingsRegistry,
  history: SpotterHistoryRegistry,
}

export type SpotterOptionWithPluginIdentifierMap = {
  [pluginIdentifier: string]: SpotterOption[] | null,
}

export type SpotterQueryCallback = (query: string, optionsMap: SpotterOptionWithPluginIdentifierMap ) => void;

export declare abstract class SpotterPluginsRegistry {
  abstract register(plugins: SpotterPluginConstructor[]): void;
  abstract onOpenSpotter(): void;
  abstract destroyPlugins(): void;
  abstract findOptionsForQuery(query: string): Promise<SpotterPluginOption[]>;
  abstract findOptionsForQueryWithActiveOption(
    query: string,
    activeOption: SpotterPluginOption,
  ): Promise<SpotterPluginOption[]>;
  abstract list: {[pluginId: string]: SpotterPluginLifecycle};
}

export declare abstract class SpotterSettingsRegistry {
  abstract getSettings(): Promise<SpotterSettings>;
  abstract patchSettings(settings: Partial<SpotterSettings>): Promise<void>;
}

export declare abstract class SpotterHistoryRegistry {
  abstract getOptionsHistory(): Promise<SpotterHistory>;
  abstract increaseOptionHistory(path: string[], query: string): void;
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

export declare abstract class SpotterApplicationsNative {
  abstract setDimensions(appName: string, x: number, y: number, width: number, height: number): void;
  abstract getDimensions(): Promise<SystemApplicationDimensions[]>;
  abstract getRunningList(): Promise<string[]>;
}

export declare abstract class SpotterStorage {
  abstract setItem<T>(key: string, value: T): Promise<void>
  abstract getItem<T>(key: string): Promise<T | null>
}

export declare abstract class SpotterState {
  abstract get query$(): Observable<string>;
  abstract set query(value: string);
  abstract get options$(): Observable<SpotterPluginOption[]>;
  abstract get options(): SpotterPluginOption[];
  abstract get loadingOptions$(): Observable<boolean>;
  abstract get typing$(): Observable<boolean>;
  abstract get activeOption$(): Observable<SpotterPluginOption | null>;
  abstract set activeOption(options: SpotterPluginOption | null);
  abstract get hoveredOptionIndex$(): Observable<number>;
  abstract set hoveredOptionIndex(value: number);
  abstract get hoveredOptionIndex(): number;
  reset(): void;
}

export declare abstract class SpotterApplications {
  abstract get value(): Application[];
  abstract get value$(): Observable<Application[]>;
}

/* Base interfaces */

export declare type SpotterAction = () => any | Promise<any>;

export type SpotterOptionBaseImage = string | number | { uri: string } | undefined;

export interface SpotterOption {
  title: string;
  action?: SpotterAction;
  onQuery?: (query: string) => Promise<SpotterOption[]> | SpotterOption[];
  subtitle?: string;
  keywords?: string[];
  icon?: SpotterOptionBaseImage;
}

export interface SpotterPluginOption extends SpotterOption {
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

  abstract onQuery(query: string): SpotterOption[] | Promise<SpotterOption[]>;

  public extendableForOption?: string;

  public options?: SpotterOption[];

  abstract onInit?(): void;

  abstract onOpenSpotter?(): void;

  abstract onDestroy?(): void;

}

export interface SpotterPluginConstructor {
  new(nativeModules: SpotterApi): SpotterPluginLifecycle;
}

export interface SpotterHotkey {
  keyCode: number;
  modifiers: number;
  doubledModifiers: boolean;
}

export interface SpotterWebsiteShortcut{
  shortcut: string;
  url: string;
}

export type SpotterPluginHotkeys = {
  [plugin: string]: { [option: string]: SpotterHotkey | null };
}

export interface SpotterSettings {
  hotkey: SpotterHotkey | null;
  pluginHotkeys: SpotterPluginHotkeys;
}

export type SpotterHistoryExecutionsTotal = number;

export type SpotterHistoryItem = {
  queries: { [query: string]: SpotterHistoryExecutionsTotal };
  total: SpotterHistoryExecutionsTotal;
}

export type SpotterHistory = {
  [option: string]: SpotterHistoryItem;
}

export interface SpotterBluetoothItem {
  name: string,
  connected: boolean,
  paired: boolean,
  address: string,
}

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

export interface Application {
  title: string,
  path: string,
}

export interface SpotterHotkeyEvent {
  hotkey: SpotterHotkey,
  identifier: string,
}

