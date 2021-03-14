import { SpotterBluetoothItem, SpotterOption, SpotterPlugin, SpotterPluginLifecycle, spotterSearch } from '../../core';
import icon from './icon.png';
import iconInactive from './icon_inactive.png';

export class BluetoothPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  identifier = 'Bluetooth';

  private bluetoothDevices: SpotterOption[] = [];

  async onOpenSpotter() {
    const bluetoothDevices = await this.nativeModules.bluetooth
      .getDevices()
      .then(devices => devices.sort((a, b) => Number(b.connected) - Number(a.connected)));

    this.bluetoothDevices = bluetoothDevices.map(device => ({
      title: device.name,
      subtitle: device.connected ? 'Disconnect' : 'Connect',
      action: device.connected ? () => this.disconnect(device.address) : () => this.connect(device.address),
      icon: device?.connected ? this.getIcon() : this.getIconInactive(),
    }));
  }

  async onQuery(query: string): Promise<SpotterOption[]> {
    return spotterSearch(query, this.bluetoothDevices, this.identifier);
  }

  getIcon() {
    return icon;
  }

  getIconInactive() {
    return iconInactive;
  }

  private connect(address: string): Promise<boolean> {
    this.nativeModules.bluetooth.connectDevice(address);
    return this.executeCommandWithTimer(
      devices => devices.find(d => d.address === address)?.connected,
    );
  }

  private disconnect(address: string): Promise<boolean> {
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
