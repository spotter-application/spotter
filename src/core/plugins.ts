import { Option } from '@spotter-app/core';
import { PLUGINS_REGISTRY } from './constants';
import { SpotterPluginOption } from './interfaces';
import { ShellNative, StorageNative } from './native';

export interface SpotterPlugins {

}

export class Plugins implements SpotterPlugins {

  private cachedRegistry: string[] = ['spotter-spotify-plugin'];

  constructor() {
  }

  async register(plugin: string) {
    // const registry = await this.storage.getItem<string[]>(PLUGINS_REGISTRY) ?? [];
    // const updatedRegistry = [...registry, plugin];
    // this.storage.setItem(PLUGINS_REGISTRY, updatedRegistry);
    // this.cachedRegistry = updatedRegistry;
  }

  async onQuery(query: string): Promise<SpotterPluginOption[]> {
    // const plugins = await this.getCachedOrCurrentRegistry();

    // const options: SpotterPluginOption[][] = await Promise.all(plugins.map(
    //   async plugin => await this.shell.execute(`${plugin} query ${query}`)
    //     .then(v => v ? JSON.parse(v).map((o: Option) => ({...o, plugin})) : [])
    // ));

    // return options.flat(1);
    return Promise.resolve([]);
  }

  /* ---------------------------------------------- */

  private async getCachedOrCurrentRegistry(): Promise<string[]> {
    // if (!this.cachedRegistry) {
    //   const registry = await this.storage.getItem<string[]>(PLUGINS_REGISTRY) ?? [];
    //   this.cachedRegistry = registry;
    // }

    // return this.cachedRegistry;
    return Promise.resolve([]);
  }
}
