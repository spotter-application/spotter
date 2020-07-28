import {
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import { SpotterActionId, SpotterOption } from '@spotter-app/core';

export default class Panel {
  private panel = NativeModules.Panel;

  private panelEventEmitter = new NativeEventEmitter(this.panel);

  displayOptions(options: SpotterOption[]) {
    this.panel.displayOptions(options);
  }

  registerHotkey(hotkey: any) {
    this.panel.registerHotkey();
  }

  registerOnSelectedCallback(callback: (option: SpotterActionId) => void) {
    this.panelEventEmitter.addListener('onSelected', (event) => callback(event));
  }

  registerQueryCallback(callback: (event: string) => void) {
    this.panelEventEmitter.addListener('query', (event) => callback(event));
  }
}
