import {
  SpotterApi,
  SpotterOption,
  SpotterPluginOption,
  SpotterPluginConstructor,
  SpotterPluginLifecycle,
  SpotterPluginsRegistry,
} from '..';

export class PluginsRegistry implements SpotterPluginsRegistry {

  private readonly pluginsRegistry = new Map<string, SpotterPluginLifecycle>();
  private readonly optionsRegistry = new Map<string, SpotterOption[]>();
  private nativeModules: SpotterApi;

  constructor(
    nativeModules: SpotterApi,
  ) {
    this.nativeModules = nativeModules;
  }

  public register(plugins: SpotterPluginConstructor[]): void {
    if (!plugins?.length) {
      return;
    }

    plugins.forEach(async pluginConstructor => {
      const plugin = new pluginConstructor(this.nativeModules);
      const pluginIdentifier = plugin?.identifier ?? pluginConstructor.name;
      if (this.pluginsRegistry.get(pluginIdentifier)) {
        // throw new Error(`Duplicated plugin title: ${pluginIdentifier}`);
        return;
      };

      // TODO: check onInit before pushing plugin to registry
      if (plugin?.onInit) {
        plugin.onInit();
      };

      this.pluginsRegistry.set(pluginIdentifier, plugin);

      if (plugin?.options?.length) {
        this.optionsRegistry.set(pluginIdentifier, plugin.options);
      };
    });
  }

  public async findOptionsForQueryWithActiveOption(
    query: string,
    activeOption: SpotterPluginOption,
   ): Promise<SpotterPluginOption[]> {
    if (!activeOption || !activeOption.onQuery || !activeOption.plugin) {
      return [];
    }

    const options = await activeOption.onQuery(query);

    return options.map(o => ({...o, plugin: activeOption.plugin}));
  }

  public async findOptionsForQuery(query: string): Promise<SpotterPluginOption[]> {

    const opts = await this.nativeModules.shell.execute(`spotter-spotify-plugin query ${query}`);

    if (!opts) {
      return [];
    }

    return Promise.resolve(JSON.parse(opts).map((opt: any) => ({
      plugin: '',
      title: opt.title,
      icon: { uri: '/Users/denis/Developer/spotter-spotify-plugin/icon.png' },
    })));


    const options = await Object
      .entries(this.list)
      .reduce<Promise<any>>(async (prevPromise, [pluginIdentifier, plugin]) => {
        const acc: SpotterPluginOption[] = await prevPromise;

        if (!plugin.onQuery) {
          return acc;
        }

        const options = await plugin.onQuery(query);

        if (!options?.length) {
          return acc;
        }

        if (plugin.extendableForOption) {
          return [
            ...acc.filter(o => o.title !== plugin.extendableForOption),
            ...options.map(o => ({...o, plugin: pluginIdentifier})),
          ];
        }

        return [...acc, ...options.map(o => ({...o, plugin: pluginIdentifier}))];
      }, Promise.resolve([]));

    return options;
  }

  public onOpenSpotter() {
    Object.values(this.list).forEach(plugin => {
      if (plugin.onOpenSpotter) {
        plugin.onOpenSpotter();
      }
    });
  }

  public destroyPlugins() {
    Object.entries(this.list).forEach(async ([_, plugin]) => plugin.onDestroy ? plugin.onDestroy() : null);
  }

  public get list(): { [pluginId: string]: SpotterPluginLifecycle } {
    return Array.from(this.pluginsRegistry.entries()).reduce((acc, [key, plugin]) => ({ ...acc, [key]: plugin }), {});
  }

}
