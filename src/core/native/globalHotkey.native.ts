import {
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import { SpotterActionId, SpotterGlobalHotkey } from '../shared';

export class GlobalHotkeyNative implements SpotterGlobalHotkey {
  private hotkey = NativeModules.GlobalHotkey;

  private panelEventEmitter = new NativeEventEmitter(this.hotkey);

  register(key: string, modifier: string) {
    this.hotkey.register(key, modifier);
  }

  onPress(callback: (option: SpotterActionId) => void) {
    this.panelEventEmitter.addListener('onPress', (event) => callback(event));
  }

}
