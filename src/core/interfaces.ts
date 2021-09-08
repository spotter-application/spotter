import { Option, OutputCommand } from '@spotter-app/core/dist/interfaces';

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

/* Base interfaces */

export declare type SpotterAction = () => any | Promise<any>;

export type SpotterOptionBaseImage = string | number | { uri: string } | undefined;

export interface SpotterOption {
  title: string;
  id?: string;
  action?: SpotterAction;
  onQuery?: (query: string) => Promise<SpotterOption[]> | SpotterOption[];
  subtitle?: string;
  keywords?: string[];
  icon?: SpotterOptionBaseImage;
}

export function isExternalPluginOption(payload: any): payload is ExternalPluginOption {
  return typeof payload === 'object' && payload.plugin && payload.title;
}

export interface ExternalPluginOption extends Option {
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

export type InternalPluginOption = {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: () => void,
  queryAction?: (query: string) => InternalPluginOption[],
}

export declare abstract class InternalPluginLifecycle {
  abstract onInit?(): InternalPluginOption[];
}

export interface SpotterPluginConstructor {
  new(nativeModules: SpotterApi): InternalPluginLifecycle;
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

export type PluginOutputCommand = OutputCommand & {
  plugin: string;
}

export interface RegisteredOptions {
  [plugin: string]: ExternalPluginOption[],
}

export interface HandleCommandResult {
  optionsToRegister: null | RegisteredOptions,
  optionsToSet: null | ExternalPluginOption[],
  queryToSet: null | string,
}
