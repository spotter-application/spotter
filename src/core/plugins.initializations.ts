import { BehaviorSubject, Observable } from 'rxjs';
import { map, skip } from 'rxjs/operators';
import PluginsRegistry from './plugins.registry';
import {
  SpotterNativeModules,
  SpotterOption,
  SpotterOptionWithId,
  SpotterPluginConstructor,
} from './shared';
import {
  Api,
  Clipboard,
  GlobalHotkey,
  Notifications,
  StatusBar,
  Storage,
} from './native';
import { generateId } from './helpers';

export default class SpotterPluginsInitializations {

  private pluginsRegistry = new PluginsRegistry();
  private optionsMapSubject$ = new BehaviorSubject<{ [pluginId: string]: SpotterOptionWithId[] }>({});

  public options$: Observable<SpotterOptionWithId[]> = this.optionsMapSubject$.asObservable().pipe(
    skip(1), // Initialization of BehaviorSubject
    map(optionsMap => Object.values(optionsMap).reduce((acc, v) => ([...acc, ...v]), [])),
  );

  constructor(private plugins: SpotterPluginConstructor[]) {
    this.init();
  }

  public destroy() {
    this.pluginsRegistry.list.forEach(plugin => plugin.onDestroy ? plugin.onDestroy() : null);
  }

  public async onQuery(query: string) {
    Object.entries(this.pluginsRegistry.listWithIds).forEach(async ([pluginId, plugin]) => {
      if (!plugin.onQuery) {
        return;
      }

      const options: SpotterOption[] = await plugin.onQuery(query);

      this.setOptions(pluginId)(options);
    });
  }

  private init() {
    const nativeModules = this.initNativeModules();
    this.pluginsRegistry.register(
      this.plugins.map(plugin => new plugin(nativeModules))
    );
    this.pluginsRegistry.list.forEach(plugin => plugin.onInit ? plugin.onInit() : null);
  }

  private initNativeModules(): SpotterNativeModules {
    const globalHotKey = new GlobalHotkey();
    const api = new Api();
    const storage = new Storage();
    const notifications = new Notifications();
    const statusBar = new StatusBar();
    const clipboard = new Clipboard();
    return { api, storage, globalHotKey, notifications, statusBar, clipboard };
  }

  private setOptions = (pluginId: string) => (options: SpotterOption[]) => {
    const currentOptions = this.optionsMapSubject$.value;
    this.optionsMapSubject$.next({ ...currentOptions, [pluginId]: options.map(o => ({ ...o, id: generateId() })) });
  }

}
