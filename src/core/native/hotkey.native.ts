import {
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import { SpotterActionId } from '@spotter-app/core';

export default class GlobalHotkey {
  private hotkey = NativeModules.GlobalHotkey;

  private panelEventEmitter = new NativeEventEmitter(this.hotkey);

  register(key: string, modifier: string) {
    this.hotkey.register(key, modifier);
  }

  onPress(callback: (option: SpotterActionId) => void) {
    this.panelEventEmitter.addListener('onPress', (event) => callback(event));
  }

}
