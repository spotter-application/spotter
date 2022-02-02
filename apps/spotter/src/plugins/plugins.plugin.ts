import { onQueryFilter, OnQueryOption, PluginConnection, SpotterPlugin } from '@spotter-app/core';
import { shouldUpgrade } from '../helpers';
import { ShellApi } from '../native';

const INTERNAL_PLUGINS = [
  'applications-plugin',
  'plugins-manager',
  'spotter-themes',
];

const IGNORE_EXTERNAL_PLUGINS = [
  '@spotter-app/core',
  '@spotter-app/plugin',
  '@spotter-app/applications-plugin',
];

interface ExternalPlugin {
  name: string,
  version: string,
}

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
  private shell =  new ShellApi();

  async onInit() {
    this.spotter.setRegisteredOptions([{
      prefix: 'plg',
      title: 'Plugins',
      icon: '🔌',
      onQuery: this.pluginsMenu,
    }]);
  }

  private async pluginsMenu(query: string): Promise<OnQueryOption[]> {
    const plugins = await this.spotter.plugins.get();

    const externalPlugins: ExternalPlugin[] = await fetch(
      'https://registry.npmjs.com/-/v1/search?text=@spotter-app'
    )
      .then(r => r.json())
      .then(r => r.objects)
      .then(r => r.map(
        (p: { package: { name: string, version: string } }) =>
          ({ name: p.package.name, version: p.package.version })
      ))
      .then((r: ExternalPlugin[]) => r.filter(p => !IGNORE_EXTERNAL_PLUGINS.includes(p.name)))
      .catch(() => []);

    const installedPlugins = plugins.filter(p => !INTERNAL_PLUGINS.includes(p.name));

    return onQueryFilter(query, [
      ...installedPlugins.map(p => {
        const nextVersion = externalPlugins.find(ep => ep.name === p.name)?.version ?? '';
        const outdated = shouldUpgrade(p.version ?? '', nextVersion)
          ? '[Upgrade available] '
          : '';
        const dev = p.name === p.path ? '[DEV] ' : '';
        const title = `${toTitleCase(shortPath(p.name))}${p.version ? ('@' + p.version) : ''}`;

        return {
          title: `${outdated}${dev}${title}`,
          subtitle: `${p.pid ? 'Connected' : 'Not connected'}`,
          icon: p.icon,
          onQuery: () => this.pluginMenu(p, outdated ? nextVersion : undefined),
        }
      }),
      ...externalPlugins
        .filter(p => !installedPlugins.map(ip => ip.name).includes(p.name))
        .map<OnQueryOption>(p => ({
          title: `${p.name}@${p.version}`,
          subtitle: 'Not installed',
          onSubmit: () => ([{
            title: `Install ${p.name}@${p.version}`,
            onSubmit: async () => {
              // const result = await this.shell.execute('echo "hey there"').catch(e => console.log(e));
              // console.log(result);
              // return !!result;
              const result = await this.shell.execute(`npm i -g ${p.name}@${p.version}`);
              if (!result) {
                return false;
              }
              return new Promise<OnQueryOption[]>(res => setTimeout(async () => {
                res(await this.pluginsMenu(''))
              }, 2000));
            }
          }])
        })),
    ]);
  }

  private pluginMenu(plugin: PluginConnection, nextVersion?: string) {
    return [
      ...(nextVersion ? [{
        title: 'Upgrade',
        onSubmit: async () => {
          const result = this.shell.execute(`npm i -g ${plugin.name}@${nextVersion}`);
          return !!result;
        }
      }]: []),
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
