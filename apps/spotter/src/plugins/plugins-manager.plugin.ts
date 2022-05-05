import { onQueryFilter, OnQueryOption, Plugin, SpotterPluginApi } from '@spotter-app/core';
import { shouldUpgrade } from '../helpers';
import { ShellApi } from '../native';
import FS from 'react-native-fs';
import { INTERNAL_PLUGINS } from '../constants';

interface ExternalPlugin {
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

    const externalPluginsRepos = [
      'spotter-application/applications-plugin',
    ];

    const externalPlugins: ExternalPlugin[] = await externalPluginsRepos.reduce(
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
      Promise.resolve<ExternalPlugin[]>([]),
    );


    const installedPlugins = plugins.filter(p => !Object.keys(INTERNAL_PLUGINS).includes(String(p.port)));

    console.log('installedPlugins: ', installedPlugins);

    return onQueryFilter(query, [
      ...installedPlugins.map(p => {
        const nextVersion = externalPlugins.find(ep => ep.name === p.name)?.publishedAt ?? '';
        const outdated = shouldUpgrade(p.publishedAt ?? '', nextVersion)
          ? '[Upgrade available] '
          : '';
        const dev = p.name === p.path ? '[DEV] ' : '';
        const title = `${p.name}${p.versionName ? ('@' + p.versionName) : ''}`;

        return {
          title: `${outdated}${dev}${title}`,
          subtitle: `${p.connected ? 'Connected' : 'Not connected'}`,
          icon: p.icon,
          onQuery: () => this.pluginMenu(p, outdated ? nextVersion : undefined),
        }
      }),
      ...externalPlugins
        .filter(p => !installedPlugins.map(ip => ip.name).includes(p.name))
        .map<OnQueryOption>(({ name, versionName, downloadUrl, publishedAt }) => ({
          title: `${name}@${versionName}`,
          subtitle: 'Not installed',
          onSubmit: () => ([{
            title: `Install ${name}@${versionName}`,
            onSubmit: async () => {
              // const appPath = FS.MainBundlePath;
              const appPath = '/Applications/spotter.app';
              await this.shell.execute(`cd ${appPath} && mkdir -p Plugins && cd Plugins && mkdir -p ${name} && cd ${name} && wget -q ${downloadUrl} -O plugin.zip && unzip -o plugin.zip && rm -rf plugin.zip`);

              this.spotter.plugins.add({
                name,
                versionName,
                publishedAt,
                port: 3232, // TODO:
                path: `${appPath}/Plugins/${name}/${name}`,
                connected: false,
              });
              return this.emptyMenu();
            }
          }])
        })),
    ]);
  }

  private pluginMenu(plugin: Plugin, nextVersion?: string) {
    return [
      ...(nextVersion ? [{
        title: 'Upgrade',
        onSubmit: async () => {
          const result = this.shell.execute(`npm i -g ${plugin.port}@${nextVersion}`);
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

  private getUniqPort = (): number => {
    // const port = randomPort();
    // const activePluginWithPort = activePlugins$.value.find(p =>
    //   p.port === port,
    // );

    // return activePluginWithPort ? uniqPort() : port;
    return 3232;
  }
}
