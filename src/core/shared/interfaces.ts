/* Native modules */

export interface SpotterNativeModules {
  api: SpotterApi,
  storage: SpotterStorage,
  globalHotKey: SpotterGlobalHotkey,
  notifications: SpotterNotifications,
  statusBar: SpotterStatusBar,
}

export declare abstract class SpotterStatusBar {
  abstract changeTitle(title: string): void;
}

export declare abstract class SpotterPanel {
  abstract toggle(): void;
  abstract open(): void;
  abstract close(): void;
}

export declare abstract class SpotterNotifications {
  abstract show(title: string, subtitle: string): void;
}

export declare abstract class SpotterGlobalHotkey {
  abstract register(key: string, modifier: string): void;
  abstract onPress(callback: (option: SpotterActionId) => void): void;
}

export declare abstract class SpotterApi {
  abstract shellCommand(command: string): void;
  abstract getAllApplications(): Promise<SystemApplication[]>;
  abstract openApplication(path: string): void;
  abstract setDimensions(appName: string, x: number, y: number, width: number, height: number): void;
  abstract getAllDimensions(): Promise<SystemApplicationDimensions[]>;
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

  abstract onQuery(query: string): void;

  abstract onDestroy?(): void;

}

export interface SpotterPluginConstructor {
  new(
    nativeModules: SpotterNativeModules,
    setOptions: (options: SpotterOption[]) => void,
  ): SpotterPluginLifecycle;
}
