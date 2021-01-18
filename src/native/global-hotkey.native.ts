import {
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import { SpotterGlobalHotkey, SpotterHotkey } from '../core';

export class GlobalHotkeyNative implements SpotterGlobalHotkey {
  private hotkey = NativeModules.GlobalHotkey;

  private panelEventEmitter = new NativeEventEmitter(this.hotkey);

  register(hotkey: SpotterHotkey | null, identifier: string) {
    this.hotkey.register(hotkey, identifier);
  }

  onPress(callback: (event: { hotkey: SpotterHotkey, identifier: string }) => void) {
    this.panelEventEmitter.addListener('onPress', (event) => callback(event));
  }

}
