import { Hotkey } from '@spotter-app/core';
import { NativeModules, NativeEventEmitter } from 'react-native';
import { SpotterHotkeyApi, SpotterHotkeyEvent } from '../../interfaces';

export class HotkeyApi implements SpotterHotkeyApi {
  private hotkey = NativeModules.SpotterHotkey;

  private panelEventEmitter = new NativeEventEmitter(this.hotkey);

  register(hotkey: Hotkey | null, identifier: string) {
    this.hotkey.register(hotkey, identifier);
  }

  onPress(callback: (event: SpotterHotkeyEvent) => void) {
    this.panelEventEmitter.addListener('onPress', (event) => callback(event));
  }
}
