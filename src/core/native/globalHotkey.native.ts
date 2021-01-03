import {
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import { SpotterActionId, SpotterGlobalHotkey, SpotterHotkey } from '../shared';

export class GlobalHotkeyNative implements SpotterGlobalHotkey {
  private hotkey = NativeModules.GlobalHotkey;

  private panelEventEmitter = new NativeEventEmitter(this.hotkey);

  register(hotkey: SpotterHotkey | null) {
    this.hotkey.register(hotkey);
  }

  onPress(callback: (option: SpotterActionId) => void) {
    this.panelEventEmitter.addListener('onPress', (event) => callback(event));
  }

}
