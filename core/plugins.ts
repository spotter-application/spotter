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
    const selected = this.registry.reduce<{ plugin: SpotterPlugin | null, action: SpotterAction | null }>((acc, plugin) => {
      const action = plugin.actions.find(a => a.id === actionId);
      if (!action) {
        return acc;
      }

      return { plugin, action };
    }, { plugin: null, action: null })

    if (!selected.plugin || !selected.action) {
      throw new Error('Selected not registered action');
    }

    if (!selected.plugin.onSelectAction) {
      throw new Error('There is no onSelectAction method in selected plugin');
    }

    selected.plugin.onSelectAction(selected.action);
  }
}
