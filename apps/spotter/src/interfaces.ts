import {
  Hotkey,
  Command,
  ChannelForSpotter,
  SpotterOnQueryOption,
  SpotterRegistryOption,
  PluginConnection,
} from '@spotter-app/core';
 
export type PluginCommand = Command & {
  pluginName: string,
}

export type PluginOnQueryOption = SpotterOnQueryOption & {
  pluginName: string,
}

export type PluginRegistryOption = SpotterRegistryOption & {
  pluginName: string,
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
  abstract onCommand(callback: (
    event: PluginCommand,
  ) => void): void;
}

export declare abstract class SpotterStorageApi {
  abstract setItem<T>(key: string, value: T): Promise<void>
  abstract getItem<T>(key: string): Promise<T | null>
}

// TODO: check
export interface SpotterThemeColors {
  background: string,
  text: string,
  activeOptionBackground: string,
  activeOptionText: string,
  hoveredOptionBackground: string,
  hoveredOptionText: string,
}

export interface SpotterHotkeyEvent {
  hotkey: Hotkey,
  identifier: string,
}

export type ActivePlugin = PluginConnection & {
  channel: ChannelForSpotter,
}

export function isPluginOnQueryOption(
  value: PluginRegistryOption | PluginOnQueryOption): value is PluginOnQueryOption {
    return (value as PluginOnQueryOption).onHoverId !== undefined ||
    (value as PluginOnQueryOption).hovered !== undefined ||
    (value as PluginOnQueryOption).onQueryCancelId !== undefined
}
