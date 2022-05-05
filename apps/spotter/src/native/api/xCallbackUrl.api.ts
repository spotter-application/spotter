import { NativeModules, NativeEventEmitter, Alert } from 'react-native';
import { PluginCommand, SpotterXCallbackUrlApi } from '../../interfaces';

export class XCallbackUrl implements SpotterXCallbackUrlApi {
  private xCallbackUrl = NativeModules.XCallbackUrl;

  private panelEventEmitter = new NativeEventEmitter(this.xCallbackUrl);

  onCommand(callback: (event: any) => void) {
    this.panelEventEmitter.addListener('onCommand', (event) => {
      try {
        const {
          port,
          type,
          ...rest
        } = event;

        const command: PluginCommand  = {
          type,
          port: parseInt(port),
          value: Object.keys(rest).length === 1
            ? Object.values(rest)[0]
            : rest,
        }

        callback(command)
      } catch (e) {
        Alert.alert(`${e}`);
      }
    });
  }
}
