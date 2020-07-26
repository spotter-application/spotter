import { SpotterPlugin, SpotterAction, SpotterActionId } from '../base/base.plugin';
import { v4 as uuid } from 'uuid';

export default class Plugins {
  private readonly registry: SpotterPlugin[] = [];

  getAllActions(): SpotterAction[] {
    return this.registry.reduce<SpotterAction[]>((acc, plugin) => ([...acc, ...plugin.actions]), []);
  }

  register(plugin: SpotterPlugin): void {
    plugin.actions = plugin.actions.map(action => ({
      ...action,
      id: uuid(),
    }))
    this.registry.push(plugin);
  }

  onSelectAction(actionId: SpotterActionId) {
    const plugin = this.registry.find(p => p.actions.find(a => a.id === actionId));

    if (!plugin) {
      throw new Error('Selected not registered action');
    }

    if (!plugin.onSelectAction) {
      throw new Error('There is no onSelectAction method in selected plugin');
    }

    plugin.onSelectAction(actionId);
  }
}
