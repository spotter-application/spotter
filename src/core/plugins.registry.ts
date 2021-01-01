import { SpotterPluginLifecycle } from './shared';

export default class PluginsRegistry {

  private readonly registry: SpotterPluginLifecycle[] = [];

  get list(): SpotterPluginLifecycle[] {
    return this.registry;
  }

  register(plugins: SpotterPluginLifecycle[]): void {
    this.registry.push(...plugins)
  }

}
