import { Command, CommandType, SpotterPlugin } from '@spotter-app/core';
import RNFS from 'react-native-fs';

const shortPath = (path: string): string => {
  const pluginName = path.split('/').find(item => item.endsWith('-plugin'));
  if (pluginName) {
    return pluginName.replace('-plugin', '');
  }

  return path.split('/').reduce((acc, curr, index, array) => {
    if (!curr[0] || curr.endsWith('.js')) {
      return acc;
    }

    const lastItem = index === (array.length - 2);
    const item = lastItem ? curr : curr[0];
    return `${acc}/${item}`;
  }, '');
};

const toTitleCase = (path: string) => {
  return path
    .toLowerCase()
    .split(' ')
    .map(item => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ');
};

const icon = RNFS.MainBundlePath;

export class PluginsManager extends SpotterPlugin {

  async onInit() {
    this.registerOptions([{
      icon,
      title: 'Plugins',
      tabAction: this.pluginsMenu,
    }])
  }

  private async pluginsMenu() {
    const plugins = await this.getPlugins();
    return plugins.map(p => ({
      icon,
      title: toTitleCase(shortPath(p)),
      tabAction: () => this.pluginMenu(p),
    }));
  }

  private pluginMenu(plugin: string) {
    return [
      {
        icon,
        title: 'Remove',
        action: () => this.remove(plugin),
      },
    ];
  }

  private remove(plugin: string) {
    this.removePlugin(plugin);
    return true;
  }
}
