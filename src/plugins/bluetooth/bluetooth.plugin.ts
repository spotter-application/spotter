import { SpotterBluetoothItem, SpotterOption, SpotterPlugin, SpotterPluginLifecycle, spotterSearch } from '../../core';
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
          ? this.disconnectDevice(device.address)
          : this.connectDevice(device.address),
        image: icon,
      })),
      'bluetooth',
    );
  }

  private connectDevice(address: string): Promise<boolean> {
    this.nativeModules.bluetooth.connectDevice(address);
    return this.executeCommandWithTimer(
      devices => devices.find(d => d.address === address)?.connected,
    );
  }

  private disconnectDevice(address: string) {
    this.nativeModules.bluetooth.disconnectDevice(address);
    return this.executeCommandWithTimer(
      devices => !devices.find(d => d.address === address)?.connected,
    );
  }

  private executeCommandWithTimer(
    check: (devices: SpotterBluetoothItem[]) => boolean | undefined,
  ): Promise<boolean> {
    return new Promise(res => {
      let seconds = 0;
      const maxSeconds = 5;
      const interval = setInterval(async () => {
        seconds++;
        const connectedDevices = await this.nativeModules.bluetooth.getDevices();
        if (check(connectedDevices)) {
          clearInterval(interval);
          res(true);
        } else if (seconds >= maxSeconds) {
          clearInterval(interval);
          res(false);
        }
      }, 1000);
    });
  }

}