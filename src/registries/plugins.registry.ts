import {
  omit,
  SpotterCallbackOptions,
  SpotterHistoryRegistry,
  SpotterNativeModules,
  SpotterOption,
  SpotterPluginConstructor,
  SpotterPluginLifecycle,
  SpotterPluginsRegistry,
  SpotterQueryCallback,
} from '../core';
import { BehaviorSubject, Observable } from 'rxjs';

export class PluginsRegistry implements SpotterPluginsRegistry {

  private readonly pluginsRegistry = new Map<string, SpotterPluginLifecycle>();
  private readonly optionsRegistry = new Map<string, SpotterOption[]>();
  private nativeModules: SpotterNativeModules;
  private historyRegistry: SpotterHistoryRegistry;

  private currentOptionsSubject$: BehaviorSubject<SpotterCallbackOptions> = new BehaviorSubject({});

  constructor(
    nativeModules: SpotterNativeModules,
    history: SpotterHistoryRegistry,
  ) {
    this.nativeModules = nativeModules;
    this.historyRegistry = history;
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

  private currentOptions: SpotterCallbackOptions = {};

  public async findOptionsForQuery(query: string, callback: SpotterQueryCallback) {
    // const query: string = q.trim();

    const optionExecutionCounter = await this.historyRegistry.getOptionExecutionCounter();
    const maxPluginsExecutions: { [pluginIdentifier: string]: number } = {};

    Object.entries(this.list).forEach(([pluginIdentifier, plugin]) => {
      if (!plugin.onQuery) {
        this.currentOptions = { ...this.currentOptions, [pluginIdentifier]: [] };
        callback(query, this.currentOptions);
        return;
      }

      const onQuery = plugin.onQuery(query);
      const promisedOnQuery: Promise<SpotterOption[]> = onQuery instanceof Promise
        ? onQuery
        : new Promise(res => res(onQuery));

      promisedOnQuery.then(options => {
        if (!options.length) {
          this.currentOptions = omit([pluginIdentifier], this.currentOptions);
          callback(query, this.currentOptions);
          return;
        }

        const maxExecutions = Math.max(...options.map(o => optionExecutionCounter[`${pluginIdentifier}#${o.title}`] ?? 0));
        maxPluginsExecutions[pluginIdentifier] = maxExecutions;

        const sortedByFrequentlyOptions = options
          .sort((a, b) =>
            (b.title.split(' ').find(t => t.toLocaleLowerCase().startsWith(query.toLocaleLowerCase())) ? 1 : 0) -
            (a.title.split(' ').find(t => t.toLocaleLowerCase().startsWith(query.toLocaleLowerCase())) ? 1 : 0)
          )
          .sort((a, b) => (optionExecutionCounter[`${pluginIdentifier}#${b.title}`] ?? 0) - (optionExecutionCounter[`${pluginIdentifier}#${a.title}`] ?? 0));
        const nextOptions = { ...this.currentOptions, [pluginIdentifier]: sortedByFrequentlyOptions };


        const orderedPlugins = Object.keys(nextOptions)
          .sort((a, b) => maxPluginsExecutions[b] - maxPluginsExecutions[a])
          .reduce(
            (obj: any, key: string) => {
              obj[key] = nextOptions[key];
              return obj;
            },
            {}
          );

        this.currentOptions = orderedPlugins;
        callback(query, this.currentOptions);
      })
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
