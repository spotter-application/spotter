import {BehaviorSubject, Observable} from 'rxjs';
import {
  omit,
  SpotterHistoryRegistry,
  SpotterNativeModules,
  SpotterOption,
  SpotterOptionWithPluginIdentifier,
  SpotterOptionWithPluginIdentifierMap,
  SpotterPluginConstructor,
  SpotterPluginLifecycle,
  SpotterPluginsRegistry,
} from '../core';

export class PluginsRegistry implements SpotterPluginsRegistry {

  private readonly pluginsRegistry = new Map<string, SpotterPluginLifecycle>();
  private readonly optionsRegistry = new Map<string, SpotterOption[]>();
  private nativeModules: SpotterNativeModules;
  private historyRegistry: SpotterHistoryRegistry;

  constructor(
    nativeModules: SpotterNativeModules,
    history: SpotterHistoryRegistry,
  ) {
    this.nativeModules = nativeModules;
    this.historyRegistry = history;
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
        return;
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

  private activeOptionSubject$ = new BehaviorSubject<SpotterOptionWithPluginIdentifier | null>(null);

  get activeOption$(): Observable<SpotterOptionWithPluginIdentifier | null> {
    return this.activeOptionSubject$.asObservable();
  }

  private currentOptionsMapSubject$ = new BehaviorSubject<SpotterOptionWithPluginIdentifierMap>({});

  get currentOptionsMap(): SpotterOptionWithPluginIdentifierMap {
    return this.currentOptionsMapSubject$.getValue();
  }

  get currentOptionsMap$(): Observable<SpotterOptionWithPluginIdentifierMap> {
    return this.currentOptionsMapSubject$.asObservable();
  }

  public async findOptionsForQuery(q: string) {
    if (this.activeOptionSubject$.value && this.activeOptionSubject$.value.onQuery) {
      const options = await this.activeOptionSubject$.value.onQuery(q);

      this.currentOptionsMapSubject$.next({
        [this.activeOptionSubject$.value.pluginIdentifier]: options,
      });

      return;
    }

    const [ firstQ, additionalQ ] = q.split('>');
    const query = firstQ.trim();

    const optionsMap = await Object
      .entries(this.list)
      .reduce<Promise<any>>(async (prevPromise, [pluginIdentifier, plugin]) => {
        const acc: SpotterOptionWithPluginIdentifierMap = await prevPromise;

        if (!plugin.onQuery) {
          return { ...acc, [pluginIdentifier]: [] };
        }

        const options = await plugin.onQuery(query);

        if (!options?.length) {
          return omit<SpotterOptionWithPluginIdentifierMap>([pluginIdentifier], acc);
        }

        return { ...acc, [pluginIdentifier]: options };

      }, Promise.resolve({}));

    const sortedOptionsMap = await this.sortOptionsMap(optionsMap, query);
    this.currentOptionsMapSubject$.next(sortedOptionsMap);
  }

  private async sortOptionsMap(
    optionsMap: SpotterOptionWithPluginIdentifierMap,
    query: string,
  ): Promise<SpotterOptionWithPluginIdentifierMap> {

    const optionExecutionCounter = await this.historyRegistry.getOptionExecutionCounter();
    const maxPluginsExecutions: { [pluginIdentifier: string]: number } = {};
    const startWithQueryPluginMap: { [pluginIdentifier: string]: number } = {};

    return Object.entries(optionsMap).reduce((acc, [pluginIdentifier, options]) => {

      if (!options) {
        return acc;
      }

      const maxExecutions = Math.max(...options.map(o => optionExecutionCounter[`${pluginIdentifier}#${o.title}`] ?? 0));
      maxPluginsExecutions[pluginIdentifier] = maxExecutions;

      const startWithQuery = Math.max(...options.map(o => o.title.toLowerCase().startsWith(query.toLowerCase()) ? 1 : 0));
      startWithQueryPluginMap[pluginIdentifier] = startWithQuery;

      const sortedByFrequentlyOptions = options
        .sort((a, b) => (
          (optionExecutionCounter[`${pluginIdentifier}#${b.title}`] ?? 0) -
          (optionExecutionCounter[`${pluginIdentifier}#${a.title}`] ?? 0))
        )

      const nextOptions = { ...optionsMap, [pluginIdentifier]: sortedByFrequentlyOptions };

      const orderedPlugins = Object.keys(nextOptions)
        .sort((a, b) => maxPluginsExecutions[b] - maxPluginsExecutions[a])
        .sort((a, b) => startWithQueryPluginMap[b] - startWithQueryPluginMap[a])
        .reduce<SpotterOptionWithPluginIdentifierMap>((acc: SpotterOptionWithPluginIdentifierMap, key: string) => {
          acc[key] = nextOptions[key] ?? [];
          return acc;
        }, {});

      return orderedPlugins;
    }, {});
  }

  public async selectOption(
    optionWithIdentifier: SpotterOptionWithPluginIdentifier,
  ) {
    this.activeOptionSubject$.next(optionWithIdentifier);
  }

  public async executeOption(
    optionWithIdentifier: SpotterOptionWithPluginIdentifier,
    callback: (success: boolean) => void,
  ) {
    // if (this.activeOptionSubject$.value) {
    //   this.activeOptionSubject$.value.onQuery
    // }

    if (!optionWithIdentifier?.action) {
      callback(false);
      return;
    };

    this.historyRegistry.increaseOptionExecutionCounter(`${optionWithIdentifier.pluginIdentifier}#${optionWithIdentifier.title}`);

    const success = await optionWithIdentifier.action();

    if (typeof success === 'function') {
      // const option = omit<SpotterOption>(['pluginIdentifier'], optionWithIdentifier);
      const options = success();
      this.currentOptionsMapSubject$.next({[optionWithIdentifier.pluginIdentifier]: options});
      console.log(success())
      return;
    }

    if (success || typeof success !== 'boolean') {
      callback(true);
    }

    callback(false);
  };

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
