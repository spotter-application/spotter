import {
  SpotterNativeModules,
  SpotterOption,
  SpotterOptionBase,
  SpotterPluginConstructor,
  SpotterPluginLifecycle,
  SpotterPluginsRegistry,
} from '../core';
import CPromise from 'c-promise2';

export class PluginsRegistry implements SpotterPluginsRegistry {

  private readonly pluginsRegistry = new Map<string, SpotterPluginLifecycle>();
  private readonly optionsRegistry = new Map<string, SpotterOptionBase[]>();
  private nativeModules: SpotterNativeModules;
  private currentQueryOptionsWithPluginIds = new Map<string, SpotterOption[]>();

  constructor(
    nativeModules: SpotterNativeModules,
  ) {
    this.nativeModules = nativeModules;
  }

  public register(plugins: SpotterPluginConstructor[]): void {
    if (!plugins?.length) {
      return;
    }

    plugins.forEach(pluginConstructor => {
      const plugin = new pluginConstructor(this.nativeModules);
      const pluginIdentifier = plugin?.identifier ?? pluginConstructor.name;
      if (this.pluginsRegistry.get(pluginIdentifier)) {
        // throw new Error(`Duplicated plugin title: ${pluginIdentifier}`);
      }

      this.pluginsRegistry.set(pluginIdentifier, plugin);
      if (plugin?.onInit) {
        plugin.onInit();
      }

      if (plugin?.options?.length) {
        this.optionsRegistry.set(pluginIdentifier, plugin.options);
      }
    });
  }

  /* Need it to cancel promises if have a new query but still waiting for an old query result */
  private queryPromises: { [key: string]: any } = {};

  public async findOptionsForQuery(query: string, callback: (query: string, options: SpotterOption[]) => void) {
    Object.entries(this.plugins).forEach(async ([pluginIdentifier, plugin]) => {
      if (!plugin.onQuery) {
        return;
      }

      if (this.queryPromises[pluginIdentifier]) {
        this.queryPromises[pluginIdentifier].cancel();
      }

      this.queryPromises[pluginIdentifier] = new CPromise((resolve: any, reject: any) => {
        const onQuery = plugin.onQuery(query);

        return (onQuery instanceof Promise ? onQuery : new Promise(r => r(onQuery)))
          .then(resolve, reject)
      }).then((opts: SpotterOptionBase[]) => {
        const pluginOptions: SpotterOption[] = opts?.map(o => ({ ...o, plugin: pluginIdentifier}));

        this.currentQueryOptionsWithPluginIds.set(pluginIdentifier, pluginOptions);

        const accumulatedOptions: SpotterOption[] = Array.from(
          this.currentQueryOptionsWithPluginIds.values()
        ).reduce<SpotterOption[]>((acc, opts) => ([...acc, ...opts]), []);

        callback(query, accumulatedOptions);

        this.queryPromises[pluginIdentifier] = null;
      })
    });
  }

  public onOpenSpotter() {
    Object.values(this.plugins).forEach(plugin => {
      if (plugin.onOpenSpotter) {
        plugin.onOpenSpotter();
      }
    });
  }

  public destroyPlugins() {
    Object.entries(this.plugins).forEach(async ([_, plugin]) => plugin.onDestroy ? plugin.onDestroy() : null);
  }

  private get plugins(): { [pluginId: string]: SpotterPluginLifecycle } {
    return Array.from(this.pluginsRegistry.entries()).reduce((acc, [key, plugin]) => ({ ...acc, [key]: plugin }), {});
  }

  public get options(): { [pluginId: string]: SpotterOptionBase[] } {
    return Array.from(this.optionsRegistry.entries()).reduce((acc, [key, options]) => ({ ...acc, [key]: options }), {});
  }

}
