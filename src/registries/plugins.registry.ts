import {BehaviorSubject, Observable} from 'rxjs';
import {
  omit,
  SpotterHistoryRegistry,
  SpotterApi,
  SpotterOption,
  SpotterOptionWithPluginIdentifier,
  SpotterOptionWithPluginIdentifierMap,
  SpotterPluginConstructor,
  SpotterPluginLifecycle,
  SpotterPluginsRegistry,
  SpotterHistory,
} from '../core';

export class PluginsRegistry implements SpotterPluginsRegistry {

  private readonly pluginsRegistry = new Map<string, SpotterPluginLifecycle>();
  private readonly optionsRegistry = new Map<string, SpotterOption[]>();
  private nativeModules: SpotterApi;
  private historyRegistry: SpotterHistoryRegistry;

  constructor(
    nativeModules: SpotterApi,
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

    const sortedOptionsMap = await this.getSortedPluginsOptionsMap(optionsMap, query);
    this.currentOptionsMapSubject$.next(sortedOptionsMap);
  }

  private async getSortedPluginsOptionsMap(
    optionsMap: SpotterOptionWithPluginIdentifierMap,
    query: string,
  ): Promise<SpotterOptionWithPluginIdentifierMap> {

    const pluginHistory: SpotterHistory = await this.historyRegistry.getPluginHistory();
    const optionsHistory: SpotterHistory = await this.historyRegistry.getOptionsHistory();

    return Object.entries(optionsMap).reduce((acc, [pluginIdentifier, options]) => {

      if (!options) {
        return acc;
      }

      const sortedByFrequentlyOptions = options
        .sort((a, b) => (
          (pluginHistory[b.title]?.total ?? 0) -
          (pluginHistory[a.title]?.total ?? 0)
        ))
        .sort((a, b) => (
          (Object.entries(optionsHistory[b.title]?.queries ?? {})
            .reduce((acc, [q, counter]) => q.startsWith(query) ? acc + counter : acc, 0)
          ) -
          (Object.entries(optionsHistory[a.title]?.queries ?? {})
            .reduce((acc, [q, counter]) => q.startsWith(query) ? acc + counter : acc, 0)
          )
        ));

      const nextOptions = { ...optionsMap, [pluginIdentifier]: sortedByFrequentlyOptions };

      const orderedPlugins = Object.keys(nextOptions)
        .sort((a, b) => (
          (pluginHistory[b]?.total ?? 0) -
          (pluginHistory[a]?.total ?? 0)
        ))
        .sort((a, b) => (
          (Object.entries(optionsHistory[b]?.queries ?? {})
            .reduce((acc, [q, counter]) => q.startsWith(query) ? acc + counter : acc, 0)
          ) -
          (Object.entries(optionsHistory[a]?.queries ?? {})
            .reduce((acc, [q, counter]) => q.startsWith(query) ? acc + counter : acc, 0)
          )
        ))
        .reduce<SpotterOptionWithPluginIdentifierMap>(
          (acc: SpotterOptionWithPluginIdentifierMap, key: string) => {
            acc[key] = nextOptions[key] ?? [];
            return acc;
          },
          {},
        );

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
    query: string,
    callback: (success: boolean) => void,
  ) {
    if (!optionWithIdentifier?.action) {
      callback(false);
      return;
    };

    this.historyRegistry.increasePluginHistory(optionWithIdentifier.pluginIdentifier, query);
    this.historyRegistry.increaseOptionHistory(optionWithIdentifier.title, query);

    const success = await optionWithIdentifier.action();

    if (typeof success === 'function') {
      const options = success();
      this.currentOptionsMapSubject$.next({[optionWithIdentifier.pluginIdentifier]: options});
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
