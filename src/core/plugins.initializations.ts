import { BehaviorSubject, Observable } from 'rxjs';
import { skip } from 'rxjs/operators';
import PluginsRegistry from './plugins.registry';
import { SpotterNativeModules, SpotterOption, SpotterOptionWithId, SpotterPluginConstructor } from './shared';
import { Api, GlobalHotkey, Notifications, StatusBar, Storage } from './native';

export default class SpotterPluginsInitializations {

  private pluginsRegistry = new PluginsRegistry();
  private optionsSubject$ = new BehaviorSubject<SpotterOptionWithId[]>([]);

  public options$: Observable<SpotterOptionWithId[]> = this.optionsSubject$.asObservable().pipe(
    skip(1), // Initialization of BehaviorSubject
  );

  constructor(private plugins: SpotterPluginConstructor[]) {
    this.init();
  }

  public destroy() {
    this.pluginsRegistry.list.forEach(plugin => plugin.onDestroy ? plugin.onDestroy() : null);
  }

  public onQuery(query: string) {
    this.optionsSubject$.next([]);
    this.pluginsRegistry.list.forEach(plugin => plugin.onQuery ? plugin.onQuery(query) : null);
  }

  private init() {
    const nativeModules = this.initNativeModules();
    this.pluginsRegistry.register(
      this.plugins.map(plugin => new plugin(nativeModules, this.setOptions))
    );
    this.pluginsRegistry.list.forEach(plugin => plugin.onInit ? plugin.onInit() : null);
  }

  private initNativeModules(): SpotterNativeModules {
    const globalHotKey = new GlobalHotkey();
    const api = new Api();
    const storage = new Storage();
    const notifications = new Notifications();
    const statusBar = new StatusBar();
    return { api, storage, globalHotKey, notifications, statusBar };
  }

  private setOptions = (options: SpotterOption[]) => {
    this.optionsSubject$.next([...this.optionsSubject$.value, ...options.map(o => ({ ...o, id: this.generateId() }))]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

}
