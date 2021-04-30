import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, tap } from 'rxjs/operators';
import { SpotterApi, SpotterPluginOption, SpotterRegistries, SpotterState } from './interfaces';
import * as plugins from '../plugins'
import { SPOTTER_HOTKEY_IDENTIFIER } from './constants';
import { sortOptions, spotterGlobalHotkeyPress } from './helpers';

export class State implements SpotterState {

  private api: SpotterApi;
  private registries: SpotterRegistries;

  private subscriptions: Subscription[] = [];

  constructor(api: SpotterApi, registries: SpotterRegistries) {
    this.api = api;
    this.registries = registries;

    this.init();
  }

  private init() {
    this.registerHotkeys();
    this.registerPlugins();
    this.subscriptions.push(
      this.subscribeForQuery(),
      this.subscribeForActiveOption(),
    );
  }

  private registerPlugins() {
    this.registries.plugins.register(Object.values(plugins));
  }

  private async registerHotkeys() {
    const settings = await this.registries.settings.getSettings();

    this.api.globalHotKey.register(settings?.hotkey, SPOTTER_HOTKEY_IDENTIFIER);
    Object.entries(settings.pluginHotkeys).forEach(([plugin, options]) => {
      Object.entries(options).forEach(([option, hotkey]) => {
        this.api.globalHotKey.register(hotkey, `${plugin}#${option}`);
      });
    });

    this.api.globalHotKey.onPress(e => spotterGlobalHotkeyPress(e, this.registries, this.api));
  }

  private subscribeForQuery(): Subscription {
    return this.query$.pipe(
      distinctUntilChanged(),
      filter(query => !!(query?.length || this.activeOption)),
      tap(async query => {
        this.typingSubject$.next(true);

        this.loadingOptionsSubject$.next(true);

        const options = this.activeOption
          ? await this.registries.plugins.findOptionsForQueryWithActiveOption(query, this.activeOption)
          : await this.registries.plugins.findOptionsForQuery(query);
        const optionsHistory = await this.registries.history.getOptionsHistory();
        const sortedOptions = await sortOptions(query, options, optionsHistory, this.activeOption);

        this.optionsSubject$.next(sortedOptions);
        this.loadingOptionsSubject$.next(false);
        this.executingOptionSubject$.next(false);
        this.hoveredOptionIndexSubject$.next(0);
      }),
      debounceTime(500),
      tap(() => this.typingSubject$.next(false)),
    ).subscribe();
  }

  private subscribeForActiveOption(): Subscription {
    return this.activeOption$.pipe(
      distinctUntilChanged(),
      filter(activeOption => !!activeOption),
      tap(() => {
        this.optionsSubject$.next([]);
        this.hoveredOptionIndexSubject$.next(0);
        this.querySubject$.next('');
      })
    ).subscribe();
  }

  /* ------------- */

  private activeOptionSubject$ = new BehaviorSubject<SpotterPluginOption | null>(null);

  get activeOption$(): Observable<SpotterPluginOption | null> {
    return this.activeOptionSubject$.asObservable();
  }

  get activeOption(): SpotterPluginOption | null {
    return this.activeOptionSubject$.getValue();
  }

  set activeOption(value: SpotterPluginOption | null) {
    this.activeOptionSubject$.next(value);
  }

  /* ------------- */

  private typingSubject$ = new BehaviorSubject<boolean>(false);

  get typing$(): Observable<boolean> {
    return this.typingSubject$.asObservable();
  }

  /* ------------- */

  private loadingOptionsSubject$ = new BehaviorSubject<boolean>(false);

  get loadingOptions$(): Observable<boolean> {
    return this.loadingOptionsSubject$.asObservable();
  }

  /* ------------- */

  private executingOptionSubject$ = new BehaviorSubject<boolean>(false);

  get executingOption$(): Observable<boolean> {
    return this.executingOptionSubject$.asObservable();
  }

  /* ------------- */

  private hoveredOptionIndexSubject$ = new BehaviorSubject<number>(0);

  get hoveredOptionIndex$(): Observable<number> {
    return this.hoveredOptionIndexSubject$.asObservable();
  }

  set hoveredOptionIndex(value: number) {
    this.hoveredOptionIndexSubject$.next(value);
  }

  get hoveredOptionIndex(): number {
    return this.hoveredOptionIndexSubject$.getValue();
  }

  /* ------------- */

  private optionsSubject$ = new BehaviorSubject<SpotterPluginOption[]>([]);

  get options$(): Observable<SpotterPluginOption[]> {
    return this.optionsSubject$.asObservable();
  }

  get options(): SpotterPluginOption[] {
    return this.optionsSubject$.getValue();
  }

  /* ------------- */

  private querySubject$ = new BehaviorSubject<string>('');

  get query$(): Observable<string> {
    return this.querySubject$.asObservable();
  }

  set query(value: string) {
    this.querySubject$.next(value);
  }

  /* ------------- */

  reset() {
    this.hoveredOptionIndex = 0;
    this.optionsSubject$.next([]);
    this.activeOption = null;
    this.query = '';
  }

}
