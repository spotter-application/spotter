import { OnQueryOption } from '@spotter-app/core';
import { Plugin, promisedExec } from '@spotter-app/plugin';

interface Device {
  title: string,
  connected: boolean,
  id: string,
}

new class CalculatorPlugin extends Plugin {
  activeIcon = `${__dirname}/icons/active.png`;
  inactiveIcon = `${__dirname}/icons/inactive.png`;

  constructor() {
    super('bluetooth-plugin');
  }

  async onInit() {
    this.spotter.setRegisteredOptions([{
      title: 'Bluetooth Preferences',
      prefix: 'blt',
      icon: this.activeIcon,
      replaceOptions: ['Bluetooth Preferences'],
      onQuery: async (q: string) => await this.getDevicesOptions(q),
    }]);
  }

  private async getDevicesOptions(q: string, hoveredId?: string): Promise<OnQueryOption[]> {
    const pairedDevicesData = await promisedExec(`osascript ${__dirname}/scripts/list.applescript`);

    const pairedDevices: Device[] = pairedDevicesData.split('\n').filter(d => !!d).map(d => {
      const values = d.split('%%$$');
      return {
        title: values[0],
        connected: values[1] === 'connected',
        id: values[2],
      }
    })

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
    const result = await promisedExec(`osascript ${__dirname}/scripts/connect.applescript ${device.id}`)
      .then(() => true)
      .catch(() => false);

    if (!result) {
      this.spotter.setError(`Can not connect ${device.title}`);
    }

    return await this.getDevicesOptions(
      query,
      device.id
    );
  }

  private async disconnect(device: Device, query: string) {
    const result = await promisedExec(`osascript ${__dirname}/scripts/disconnect.applescript ${device.id}`)
      .then(() => true)
      .catch(() => false);

    if (!result) {
      this.spotter.setError(`Can not connect ${device.title}`);
    }

    return new Promise<OnQueryOption[]>(res => setTimeout(async () => {
      res(await this.getDevicesOptions(query, device.id))
    }, 2000));
  }
}
