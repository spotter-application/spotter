import Api from './native/api.native';
import GlobalHotkey from './native/globalHotkey.native';
import Notifications from './native/notifications.native';
import StatusBar from './native/statusBar.native';
import Storage from './native/storage.native';
import PluginsRegistry from './plugins.registry';
import { SpotterNativeModules, SpotterOption, SpotterPluginConstructor } from './shared';
import { BehaviorSubject, Observable } from 'rxjs';
import { skip } from 'rxjs/operators';

export default class SpotterPluginsInitializations {

  private pluginsRegistry = new PluginsRegistry();
  private optionsSubject$ = new BehaviorSubject<SpotterOption[]>([]);

  public options$: Observable<SpotterOption[]> = this.optionsSubject$.asObservable().pipe(
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
    this.optionsSubject$.next([...this.optionsSubject$.value, ...options]);
  }

}
