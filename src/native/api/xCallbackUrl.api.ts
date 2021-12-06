import { NativeModules, NativeEventEmitter, Alert } from 'react-native';
import { PluginCommand, SpotterXCallbackUrlApi } from '../../interfaces';

export class XCallbackUrl implements SpotterXCallbackUrlApi {
  private xCallbackUrl = NativeModules.XCallbackUrl;

  private panelEventEmitter = new NativeEventEmitter(this.xCallbackUrl);

  onCommand(callback: (event: any) => void) {
    this.panelEventEmitter.addListener('onCommand', (event) => {
      try {
        const {
          pluginName,
          type,
          ...rest
        } = event;

        const command: PluginCommand  = {
          pluginName,
          type,
          value: rest.length ? {
            ...rest,
          } : rest,
        }

        callback(command)
      } catch (e) {
        Alert.alert(`${e}`);
      }
    });
  }
}
