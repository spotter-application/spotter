import { NativeModules, NativeEventEmitter, Alert } from 'react-native';
import { PluginCommand, SpotterXCallbackUrlApi } from '../../interfaces';

export class XCallbackUrl implements SpotterXCallbackUrlApi {
  private xCallbackUrl = NativeModules.XCallbackUrl;

  private panelEventEmitter = new NativeEventEmitter(this.xCallbackUrl);

  onCommand(callback: (event: PluginCommand) => void) {
    this.panelEventEmitter.addListener('onCommand', (event) => {
      if (event.value && typeof event.value === 'string' && event.value.startsWith('{')) {
        try {
          event.value = JSON.parse(event.value);
        } catch (e) {
          Alert.alert(`${e}`);
        }
      }
      callback(event)
    });
  }
}
