import { BehaviorSubject, Observable } from 'rxjs';
import { map, skip } from 'rxjs/operators';
import { generateId } from '../helpers';
import {
  SpotterNativeModules,
  SpotterOption,
  SpotterOptionWithId,
  SpotterPluginConstructor,
  SpotterPluginLifecycle,
  SpotterPluginsRegistry,
} from '../core';

export class PluginsRegistry implements SpotterPluginsRegistry {

  private readonly registry = new Map<string, SpotterPluginLifecycle>();
  private nativeModules: SpotterNativeModules;
  private optionsToRenderSubject$ = new BehaviorSubject<{ [pluginId: string]: SpotterOptionWithId[] }>({});

  public options$: Observable<SpotterOptionWithId[]> = this.optionsToRenderSubject$.asObservable().pipe(
    skip(1), // Initialization of BehaviorSubject
    map(optionsMap => Object.values(optionsMap).reduce((acc, v) => ([...acc, ...v]), [])),
  );

  constructor(
    nativeModules: SpotterNativeModules,
  ) {
    this.nativeModules = nativeModules;
  }

  public register(plugins: SpotterPluginConstructor[]): void {
    if (!plugins?.length) {
      return;
    }

    plugins.forEach(pluginConstructor => {
      const plugin = new pluginConstructor(this.nativeModules);
      this.registry.set(generateId(), plugin);
      if (plugin.onInit) {
        plugin.onInit();
      }
    });
  }

  public async findOptionsForQuery(query: string) {
    Object.entries(this.listWithIds).forEach(async ([pluginId, plugin]) => {
      if (!plugin.onQuery) {
        return;
      }

      const options: SpotterOption[] = await plugin.onQuery(query);

      this.setOptionsToRender(pluginId)(options);
    });
  }

  public destroy() {
    this.list.forEach(plugin => plugin.onDestroy ? plugin.onDestroy() : null);
  }

  private setOptionsToRender = (pluginId: string) => (options: SpotterOption[]) => {
    const currentOptionsToRender = this.optionsToRenderSubject$.value;
    this.optionsToRenderSubject$.next({ ...currentOptionsToRender, [pluginId]: options.map(o => ({ ...o, id: generateId() })) });
  }

  private get list(): SpotterPluginLifecycle[] {
    return Array.from(this.registry.values());
  }

  private get listWithIds(): { [pluginId: string]: SpotterPluginLifecycle } {
    return Array.from(this.registry.entries()).reduce((acc, [key, plugin]) => ({ ...acc, [key]: plugin }), {});
  }

}
