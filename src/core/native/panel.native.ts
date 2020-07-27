import {
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import { SpotterAction, SpotterActionId } from '@spotter-app/core';

export default class Panel {
  private panel = NativeModules.Panel;

  private panelEventEmitter = new NativeEventEmitter(this.panel);

  registerOptions(options: SpotterAction[]) {
    this.panel.registerOptions(options);
  }

  registerHotkey(hotkey: any) {
    this.panel.registerHotkey();
  }

  registerOnSelectedCallback(callback: (option: SpotterActionId) => void) {
    this.panelEventEmitter.addListener('onSelected', (event) => callback(event?.value));
  }
}
