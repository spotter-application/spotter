import {
  SpotterNativeModules,
  SpotterOption,
  SpotterPluginConstructor,
  SpotterPluginLifecycle,
  SpotterPluginsRegistry,
  spotterGenerateId,
} from '../core';

export class PluginsRegistry implements SpotterPluginsRegistry {

  private readonly registry = new Map<string, SpotterPluginLifecycle>();
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
      this.registry.set(spotterGenerateId(), plugin);
      if (plugin.onInit) {
        plugin.onInit();
      }
    });
  }

  public async findOptionsForQuery(query: string, callback: (options: SpotterOption[]) => void) {
    Object.entries(this.plugins).forEach(async ([pluginId, plugin]) => {
      if (!plugin.onQuery) {
        return;
      }

      const pluginOptions: SpotterOption[] = await plugin.onQuery(query);

      this.currentQueryOptionsWithPluginIds.set(pluginId, pluginOptions);

      const accumulatedOptions: SpotterOption[] = Array.from(
        this.currentQueryOptionsWithPluginIds.values()
      ).reduce((acc, o) => ([...acc, ...o]), []);

      callback(accumulatedOptions);
    });
  }

  public destroy() {
    Object.entries(this.plugins).forEach(async ([_, plugin]) => plugin.onDestroy ? plugin.onDestroy() : null);
  }

  private get plugins(): { [pluginId: string]: SpotterPluginLifecycle } {
    return Array.from(this.registry.entries()).reduce((acc, [key, plugin]) => ({ ...acc, [key]: plugin }), {});
  }

}
