import { generateId } from './helpers';
import { SpotterPluginLifecycle } from './shared';

export default class PluginsRegistry {

  private readonly registry = new Map<string, SpotterPluginLifecycle>();

  get list(): SpotterPluginLifecycle[] {
    return Array.from(this.registry.values());
  }

  get listWithIds(): { [pluginId: string]: SpotterPluginLifecycle } {
    return Array.from(this.registry.entries()).reduce((acc, [key, plugin]) => ({ ...acc, [key]: plugin }), {});
  }

  register(plugins: SpotterPluginLifecycle[]): void {
    plugins.forEach(plugin => this.registry.set(generateId(), plugin));
  }

}
