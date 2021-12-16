import { PluginConnection, SpotterPlugin } from '@spotter-app/core';

const INTERNAL_PLUGINS = [
  'plugins-manager',
  'spotter-themes',
];

const shortPath = (pluginName: string): string => {
  return pluginName
    .replace('@spotter-app/', '')
    .replace('-plugin', '');
};

const toTitleCase = (path: string) => {
  return path
    .toLowerCase()
    .split(' ')
    .map(item => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ');
};

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
    const plugins = await this.spotter.plugins.get();
    return plugins
      .filter(p => !INTERNAL_PLUGINS.includes(p.name))
      .map(p => ({
        title: `${p.name === p.path ? '[DEV] ' : ''}${toTitleCase(shortPath(p.name))}${p.version ? ('@' + p.version) : ''}`,
        subtitle: `${p.pid ? 'Connected' : 'Not connected'}`,
        icon: p.icon,
        onQuery: () => this.pluginMenu(p),
      }));
  }

  private pluginMenu(plugin: PluginConnection) {
    return [
      {
        title: 'Reconnect',
        onSubmit: () => this.reconnect(plugin),
      },
      {
        title: 'Remove',
        onSubmit: () => this.remove(plugin),
      },
    ];
  }

  private async reconnect(plugin: PluginConnection) {
    this.spotter.plugins.start(plugin.path);
    return true;
  }

  private remove(plugin: PluginConnection) {
    this.spotter.plugins.remove(plugin.name);
    return true;
  }
}
