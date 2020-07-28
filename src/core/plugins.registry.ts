import { SpotterPlugin } from '@spotter-app/core';
import { v4 as uuid } from 'uuid';

export default class PluginsRegistry {

  private readonly registry = new Map<string, SpotterPlugin>();

  get list(): SpotterPlugin[] {
    return Array.from(this.registry).map(entities => entities[1]);
  }

  register(plugins: SpotterPlugin[]): void {
    plugins.forEach(plugin => this.registry.set(uuid(), plugin));
  }

}
