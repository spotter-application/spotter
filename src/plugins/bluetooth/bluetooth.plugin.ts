import { SpotterOption, SpotterPlugin, SpotterPluginLifecycle, spotterSearch } from '../../core';
import icon from './icon.png';

export class BluetoothPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  async onQuery(query: string): Promise<SpotterOption[]> {
    const bluetoothDevices = await this.nativeModules.bluetooth
      .getDevices()
      .then(devices => devices.sort((a, b) => Number(b.connected) - Number(a.connected)));

    return spotterSearch(
      query,
      bluetoothDevices.map(device => ({
        title: device.name,
        subtitle: device.connected ? 'Connected' : 'Disconnected',
        action: () => device.connected
          ? this.nativeModules.bluetooth.disconnectDevice(device.address)
          : this.nativeModules.bluetooth.connectDevice(device.address),
        image: icon,
      })),
      'bluetooth',
    );
  }

}
