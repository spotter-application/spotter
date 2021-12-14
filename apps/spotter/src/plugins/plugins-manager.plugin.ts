import { SpotterPlugin } from '@spotter-app/core';

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

// const icon = RNFS.MainBundlePath;

export class PluginsManagerPlugin extends SpotterPlugin {

  async onInit() {
    this.spotter.setRegisteredOptions([{
      prefix: 'plg',
      title: 'Plugins',
      icon: '🔌',
      onQuery: this.pluginsMenu,
    }]);
  }

  private async pluginsMenu() {
    // TODO: display dev plugins as well
    const plugins = await this.spotter.plugins.get();
    return plugins.map(p => ({
      title: toTitleCase(shortPath(p.path)),
      onQuery: () => this.pluginMenu(p.path),
    }));
  }

  private pluginMenu(plugin: string) {
    return [
      {
        title: 'Remove',
        onSubmit: () => this.remove(plugin),
      },
    ];
  }

  private remove(plugin: string) {
    this.spotter.plugins.remove(plugin);
    return true;
  }
}
