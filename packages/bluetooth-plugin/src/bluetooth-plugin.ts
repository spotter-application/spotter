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
  private appPath = '/Applications/Visual Studio Code.app';

  constructor() {
    super('bluetooth-plugin');
  }

  async onInit() {
    this.spotter.setRegisteredOptions([{
      title: 'Bluetooth',
      prefix: 'blt',
      icon: this.appPath,
      onQuery: async (q: string) => await this.getFolders(q),
    }]);
  }

  private async getFolders(q: string): Promise<OnQueryOption[]> {
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

    const options = pairedDevices.map(device => ({
      title: device.title,
      subtitle: device.connected ? 'Disconnect' : 'Connect',
      onSubmit: async () => device.connected
        ? await this.disconnect(device)
        : await this.connect(device)
    }));

    if (!q.length) {
      return options;
    }

    return options.filter(o => o.title.toLowerCase().split(' ').find(t => t.startsWith(q.toLowerCase())));
  }

  private async connect(device: Device) {
    const result = await promisedExec(`${path}/blueutil --connect ${device.id} --info ${device.id}`)
      .then(() => true)
      .catch(() => false);

    if (!result) {
      this.spotter.setError(`Can not connect ${device.title}`);
    }
    return result;
  }

  private async disconnect(device: Device) {
    const result = await promisedExec(`${path}/blueutil --disconnect ${device.id} --info ${device.id}`)
      .then(() => true)
      .catch(() => false);

    if (!result) {
      this.spotter.setError(`Can not connect ${device.title}`);
    }
    return result;
  }
}
