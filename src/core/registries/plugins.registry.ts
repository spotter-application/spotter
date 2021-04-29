import {BehaviorSubject, Observable} from 'rxjs';
import {
  SpotterHistoryRegistry,
  SpotterApi,
  SpotterOption,
  SpotterPluginOption,
  SpotterPluginConstructor,
  SpotterPluginLifecycle,
  SpotterPluginsRegistry,
  SpotterHistory,
} from '..';

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

  private activeOptionSubject$ = new BehaviorSubject<SpotterPluginOption | null>(null);

  get activeOption$(): Observable<SpotterPluginOption | null> {
    return this.activeOptionSubject$.asObservable();
  }

  get activeOption(): SpotterPluginOption | null {
    return this.activeOptionSubject$.getValue();
  }

  private currentOptionsSubject$ = new BehaviorSubject<SpotterPluginOption[]>([]);

  get currentOptions(): SpotterPluginOption[] {
    return this.currentOptionsSubject$.getValue();
  }

  get currentOptions$(): Observable<SpotterPluginOption[]> {
    return this.currentOptionsSubject$.asObservable();
  }

  private loadingSubject$ = new BehaviorSubject<boolean>(false);

  get loading$(): Observable<boolean> {
    return this.loadingSubject$.asObservable();
  }

  public async findOptionsForQuery(query: string) {
    this.loadingSubject$.next(true);

    const activeOption = this.activeOptionSubject$.value;
    if (activeOption && activeOption.onQuery && activeOption.plugin) {
      const options = await activeOption.onQuery(query);
      const sortedOptions = await this.getSortedPluginOptions(
        options.map(o => ({...o, plugin: activeOption.plugin})),
        query,
      );

      this.loadingSubject$.next(false);
      this.currentOptionsSubject$.next(sortedOptions);
      return;
    }

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

    const sortedOptions = await this.getSortedPluginOptions(options, query);
    this.currentOptionsSubject$.next(sortedOptions);
    this.loadingSubject$.next(false);
  }

  private getFullHistoryPath(option: string): string {
    return this.activeOption ? `${this.activeOption.title}#${option}` : option;
  }

  private async getSortedPluginOptions(
    options: SpotterPluginOption[],
    query: string,
  ): Promise<SpotterPluginOption[]> {

    const optionsHistory: SpotterHistory = await this.historyRegistry.getOptionsHistory();

    return options
      .sort((a, b) => (
        (Object.entries(optionsHistory[this.getFullHistoryPath(b.title)]?.queries ?? {})
          .reduce((acc, [q, counter]) => q.startsWith(query) ? acc + counter : acc, 0)
        ) -
        (Object.entries(optionsHistory[this.getFullHistoryPath(a.title)]?.queries ?? {})
          .reduce((acc, [q, counter]) => q.startsWith(query) ? acc + counter : acc, 0)
        )
      ));
  }

  public async activateOption(
    optionWithIdentifier: SpotterPluginOption,
  ) {
    this.activeOptionSubject$.next(optionWithIdentifier);
  }

  public async submitOption(
    option: SpotterPluginOption,
    query: string,
    callback: (success: boolean) => void,
  ) {
    if (!option?.action) {
      callback(false);
      return;
    };

    this.historyRegistry.increaseOptionHistory(
      [
        ...(this.activeOption ? [this.activeOption.title] : []),
        option.title,
      ],
      query,
    );

    const success = await option.action();

    if (typeof success === 'function') {
      const options = success();
      this.currentOptionsSubject$.next([...this.currentOptions, ...options]);
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

}
