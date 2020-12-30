import { v4 as uuid } from 'uuid';
import { SpotterQuery } from './shared';

export default class PluginsRegistry {

  private readonly registry = new Map<string, SpotterQuery>();

  get list(): SpotterQuery[] {
    return Array.from(this.registry).map(entities => entities[1]);
  }

  register(plugins: SpotterQuery[]): void {
    plugins.forEach(plugin => this.registry.set(uuid(), plugin));
  }

}
