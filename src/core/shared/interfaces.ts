/* Native modules */

export interface SpotterNativeModules {
  storage: SpotterStorage,
  globalHotKey: SpotterGlobalHotkey,
  notifications: SpotterNotifications,
  statusBar: SpotterStatusBar,
  clipboard: SpotterClipboard,
  shell: SpotterShell,
  appsDimensions: SpotterAppsDimensions,
  panel: SpotterPanel,
}

export declare abstract class SpotterShell {
  abstract execute(command: string): Promise<string>;
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

export declare type SpotterAction = () => void;

export interface SpotterOption {
  title: string;
  subtitle: string;
  image: string;
  action: SpotterAction;
}

export interface SpotterOptionWithId extends SpotterOption {
  id: string;
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
