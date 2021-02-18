import {
  omit,
  SpotterCallbackOptions,
  SpotterNativeModules,
  SpotterOption,
  SpotterOptionBase,
  SpotterPluginConstructor,
  SpotterPluginLifecycle,
  SpotterPluginsRegistry,
  SpotterQueryCallback,
} from '../core';
import { BehaviorSubject, Observable } from 'rxjs';

export class PluginsRegistry implements SpotterPluginsRegistry {

  private readonly pluginsRegistry = new Map<string, SpotterPluginLifecycle>();
  private readonly optionsRegistry = new Map<string, SpotterOptionBase[]>();
  private nativeModules: SpotterNativeModules;

  // private currentQueryOptionsWithPluginIds = new Map<string, SpotterOption[]>();

  private currentOptionsSubject$: BehaviorSubject<SpotterCallbackOptions> = new BehaviorSubject({});

  constructor(
    nativeModules: SpotterNativeModules,
  ) {
    this.nativeModules = nativeModules;
  }

  public get options(): SpotterCallbackOptions {
    return this.currentOptionsSubject$.getValue();
  }

  public get options$(): Observable<SpotterCallbackOptions> {
    return this.currentOptionsSubject$.asObservable();
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
  // private queryPromises: { [key: string]: any } = {};


  private currentOptions: SpotterCallbackOptions = {};

  public findOptionsForQuery(q: string, callback: SpotterQueryCallback) {

    const query: string = q.trim();

    Object.entries(this.list).forEach(([pluginIdentifier, plugin]) => {
      if (!plugin.onQuery) {
        this.currentOptions = { ...this.currentOptions, [pluginIdentifier]: [] };
        callback(query, this.currentOptions);
        return;
      }

      this.currentOptions = { ...this.currentOptions, [pluginIdentifier]: 'loading' };
      callback(query, this.currentOptions);

      const onQuery = plugin.onQuery(query);
      const promisedOnQuery: Promise<SpotterOptionBase[]> = onQuery instanceof Promise
        ? onQuery
        : new Promise(res => res(onQuery));

      promisedOnQuery.then(options => {
        this.currentOptions = options?.length
          ? { ...this.currentOptions, [pluginIdentifier]: options }
          : omit([pluginIdentifier], this.currentOptions);
        callback(query, this.currentOptions);
      })

      // const options = await plugin.onQuery(query);
      // this.currentOptions = { ...this.currentOptions, [pluginIdentifier]: options };
      // callback(query, this.currentOptions);
    });
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

  // public get options(): { [pluginId: string]: SpotterOptionBase[] } {
  //   return Array.from(this.optionsRegistry.entries()).reduce((acc, [key, options]) => ({ ...acc, [key]: options }), {});
  // }

}
