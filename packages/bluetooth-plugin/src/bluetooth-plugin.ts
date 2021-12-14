import { OnQueryOption } from '@spotter-app/core';
import { Plugin, promisedExec } from '@spotter-app/plugin';

interface Device {
  title: string,
  id: string,
  connected: boolean,
}

const url = import.meta.url.replace('file://', '').split('/');
url.pop();
const path = url.join('/');

new class CalculatorPlugin extends Plugin {
  private activeIcon = `${path}/icons/active.png`;
  private inactiveIcon = `${path}/icons/inactive.png`;

  constructor() {
    super('bluetooth-plugin');
  }

  async onInit() {
    this.spotter.setRegisteredOptions([{
      title: 'Bluetooth',
      prefix: 'blt',
      icon: this.activeIcon,
      onQuery: async (q: string) => await this.getDevicesOptions(q),
    }]);
  }

  private async getDevicesOptions(q: string, hoveredId?: string): Promise<OnQueryOption[]> {
    const pairedDevices: Device[] = await promisedExec(`${path}/blueutil --paired`)
    .then(result => result
      .split('\n')
      .filter(d => !!d)
      .map(d => ({
        title: /name: (.+?),/.exec(d)[1].replaceAll('"', ''),
        id: /address: (.+?),/.exec(d)[1].replaceAll('"', ''),
        connected: !d.includes('not connected'),
      }))
    )
    .catch(() => []);

    const options: OnQueryOption[] = pairedDevices.map(device => ({
      title: device.title,
      subtitle: device.connected ? 'Disconnect' : 'Connect',
      icon: device.connected ? this.activeIcon : this.inactiveIcon,
      hovered: device.id === hoveredId,
      onSubmit: async () => device.connected
        ? await this.disconnect(device, q)
        : await this.connect(device, q)
    }));

    if (!q.length) {
      return options;
    }

    return options.filter(o => o.title.toLowerCase().split(' ').find(t => t.startsWith(q.toLowerCase())));
  }

  private async connect(device: Device, query: string) {
    const result = await promisedExec(`${path}/blueutil --connect ${device.id} --info ${device.id}`)
      .then(() => true)
      .catch(() => false);

    if (!result) {
      this.spotter.setError(`Can not connect ${device.title}`);
    }

    return await this.getDevicesOptions(query, device.id);
  }

  private async disconnect(device: Device, query: string) {
    const result = await promisedExec(`${path}/blueutil --disconnect ${device.id} --info ${device.id}`)
      .then(() => true)
      .catch(() => false);

    if (!result) {
      this.spotter.setError(`Can not connect ${device.title}`);
    }

    return new Promise<OnQueryOption[]>(res => setTimeout(async () => {
      res(await this.getDevicesOptions(query, device.id))
    }, 2500));
  }
}
