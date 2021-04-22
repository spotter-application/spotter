import { NativeModules } from 'react-native';
import { SpotterBluetooth, SpotterBluetoothItem } from '..';

export class BluetoothNative implements SpotterBluetooth {
  private bluetooth = NativeModules.NativeBluetooth;

  async getDevices(): Promise<SpotterBluetoothItem[]> {
    return await this.bluetooth.getDevices();
  }

  connectDevice(address: string) {
    return this.bluetooth.connectDevice(address);
  }

  disconnectDevice(address: string) {
    return this.bluetooth.disconnectDevice(address);
  }

}
