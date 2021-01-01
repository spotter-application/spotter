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
  AppsDimensionsNative,
  ClipboardNative,
  GlobalHotkeyNative,
  NotificationsNative,
  StatusBarNative,
  StorageNative,
  ShellNative,
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
    const globalHotKey = new GlobalHotkeyNative();
    const appsDimensions = new AppsDimensionsNative();
    const storage = new StorageNative();
    const notifications = new NotificationsNative();
    const statusBar = new StatusBarNative();
    const clipboard = new ClipboardNative();
    const shell = new ShellNative();

    return {
      appsDimensions,
      storage,
      globalHotKey,
      notifications,
      statusBar,
      clipboard,
      shell,
    };
  }

  private setOptions = (pluginId: string) => (options: SpotterOption[]) => {
    const currentOptions = this.optionsMapSubject$.value;
    this.optionsMapSubject$.next({ ...currentOptions, [pluginId]: options.map(o => ({ ...o, id: generateId() })) });
  }

}
