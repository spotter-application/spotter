import {
  Hotkey,
  Option,
  OutputCommand,
  Settings,
  Storage,
} from '@spotter-app/core';
import { INTERNAL_PLUGIN_KEY } from './constants';

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
  abstract register(hotkey: Hotkey | null, identifier: string): void;
  abstract onPress(callback: (event: { hotkey: Hotkey, identifier: string }) => void): void;
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

export function isInternalPlugin(payload: any): payload is InternalPluginLifecycle {
  return typeof payload === 'object';
}

export function isExternalPluginOption(payload: any): payload is ExternalPluginOption {
  return Boolean(typeof payload === 'object' && payload.plugin !== INTERNAL_PLUGIN_KEY);
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
  plugin: string;
  subtitle?: string;
  icon?: string;
  action?: () => void,
  queryAction?: (query: string) => InternalPluginOption[] | Promise<InternalPluginOption[]>,
}

export type Options = Array<ExternalPluginOption | InternalPluginOption>;

export declare abstract class InternalPluginLifecycle {
  abstract onInit?(): InternalPluginOption[] | Promise<InternalPluginOption[]>;
}

export interface SpotterPluginConstructor {
  new(nativeModules: SpotterApi): InternalPluginLifecycle;
}

export interface SpotterWebsiteShortcut{
  shortcut: string;
  url: string;
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

export interface SpotterHotkeyEvent {
  hotkey: Hotkey,
  identifier: string,
}

export type PluginOutputCommand = OutputCommand & {
  plugin: string;
}

export interface RegisteredOptions {
  [plugin: string]: ExternalPluginOption[],
}

export interface ParseCommandsResult {
  optionsToRegister: null | RegisteredOptions,
  optionsToSet: null | ExternalPluginOption[],
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

