import {
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import { SpotterActionId, SpotterOption } from '@spotter-app/core';

export default class GlobalHotkey {
  private hotkey = NativeModules.GlobalHotkey;

  private panelEventEmitter = new NativeEventEmitter(this.hotkey);

  register(key: string, modifier: string) {
    this.hotkey.register(key, modifier);
  }

  onPress(callback: (option: SpotterActionId) => void) {
    this.panelEventEmitter.addListener('onPress', (event) => callback(event));
  }

  onEsc(callback: (option: SpotterActionId) => void) {
    this.panelEventEmitter.addListener('onEsc', (event) => callback(event));
  }

  onUpArrow(callback: (option: SpotterActionId) => void) {
    this.panelEventEmitter.addListener('onUpArrow', (event) => callback(event));
  }

  onDownArrow(callback: (option: SpotterActionId) => void) {
    this.panelEventEmitter.addListener('onDownArrow', (event) => callback(event));
  }

}
