import {
  onQueryFilter,
  OnQueryOption,
  Plugin,
  SpotterPluginApi,
} from '@spotter-app/core';
import { ShellApi } from '../native';
import FS from 'react-native-fs';
import { INTERNAL_PLUGINS } from '../constants';

const externalPluginsRepos = [
  'spotter-application/applications-plugin',
  'spotter-application/emoji-plugin',
];

export const randomPort = (): number =>
  (Math.floor(10000 + Math.random() * 9000));

interface ExternalPluginVersion {
  name: string,
  versionName: string,
  publishedAt: string,
  downloadUrl: string,
}

export class PluginsManagerPlugin extends SpotterPluginApi {
  private shell =  new ShellApi();

  async onInit() {
    this.spotter.setRegisteredOptions([{
      prefix: 'plg',
      title: 'Plugins Manager',
      subtitle: 'Install / Uninstall plugins',
      icon: '🔌',
      onQuery: this.pluginsMenu,
    }]);
  }

  private async pluginsMenu(query: string): Promise<OnQueryOption[]> {
    const plugins = await this.spotter.plugins.get();

    const externalPlugins: ExternalPluginVersion[] = await externalPluginsRepos.reduce(
      async (asyncAcc, repo) => {
        const { name, published_at, assets } = await fetch(`https://api.github.com/repos/${repo}/releases/latest`).then(r => r?.json()).catch(() => {});
        return [
          ...(await asyncAcc),
          {
            name: repo.split('/')[1],
            versionName: name,
            publishedAt: published_at,
            downloadUrl: assets.find((a: { name: string, browser_download_url: string }) => a.name === 'plugin.zip')?.browser_download_url
          },
        ];
      },
      Promise.resolve<ExternalPluginVersion[]>([]),
    );

    const installedPlugins = plugins.filter(p => !Object.keys(INTERNAL_PLUGINS).includes(String(p.port)));

    return onQueryFilter(query, [
      ...installedPlugins.map(p => {
        const externalVersion = externalPlugins.find(ep => ep.name === p.name);
        const outdated = new Date(externalVersion?.publishedAt ?? '').getTime() > new Date(p.publishedAt).getTime()
          ? ' (🔼 Upgrade available)'
          : '';
        const dev = p.name === p.path ? '[DEV] ' : '';
        const title = `${p.name}${p.versionName}`;

        return {
          title: `${dev}${title}`,
          subtitle: `${p.connected ? 'Connected' : 'Not connected'}${outdated}`,
          icon: p.icon,
          onQuery: () => this.pluginMenu(p, outdated ? externalVersion : undefined),
        }
      }),
      ...externalPlugins
        .filter(p => !installedPlugins.map(ip => ip.name).includes(p.name))
        .map<OnQueryOption>((v) => ({
          title: `${v.name}@${v.versionName}`,
          subtitle: 'Not installed',
          onSubmit: () => ([{
            title: `Install ${v.name}@${v.versionName}`,
            onSubmit: async () => {
              await this.installVersion(v);
              return this.emptyMenu();
            }
          }])
        })),
    ]);
  }

  private async installVersion(version: ExternalPluginVersion) {
    const { name, versionName, publishedAt, downloadUrl } = version;
    // const appPath = FS.MainBundlePath;
    const appPath = '/Applications/spotter.app';

    await this.shell.execute(`cd ${appPath} && mkdir -p Plugins && cd Plugins && rm -rf ${name} && mkdir ${name} && cd ${name} && curl -s ${downloadUrl} -O plugin.zip && unzip -o plugin.zip && rm -rf plugin.zip`);

    const plugins = await this.spotter.plugins.get();
    const port = this.findUnoccupiedPort(plugins);

    this.spotter.plugins.add({
      name,
      versionName,
      publishedAt,
      port,
      path: `${appPath}/Plugins/${name}/${name}`,
      connected: false,
    });
  }

  private pluginMenu(plugin: Plugin, nextVersion?: ExternalPluginVersion) {
    return [
      ...(nextVersion ? [{
        title: `Upgrade to ${nextVersion.versionName}`,
        onSubmit: async () => {
          await this.installVersion(nextVersion);
          return this.emptyMenu();
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

  private async reconnect({ port, path }: Plugin) {
    this.spotter.plugins.start({port, path});
    return this.emptyMenu();
  }

  private async remove(plugin: Plugin) {
    // TODO: Remove plugin folder
    this.spotter.plugins.remove(plugin.port);
    return this.emptyMenu();
  }

  private emptyMenu() {
    return new Promise<OnQueryOption[]>(res => setTimeout(async () => {
      res(await this.pluginsMenu(''))
    }, 2000));
  }

  private findUnoccupiedPort(installedPlugins: Plugin[]): number {
    const port = randomPort();
    const occupied = installedPlugins.find(p => p.port === port);

    if (occupied) {
      return this.findUnoccupiedPort(installedPlugins);
    }

    return port;
  }
}
