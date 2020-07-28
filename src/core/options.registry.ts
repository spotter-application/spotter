import { SpotterOption } from '@spotter-app/core';
import { v4 as uuid } from 'uuid';

export type SpotterOptionWithId = SpotterOption & { id: string };

export default class OptionsRegistry {

  private readonly registry = new Map<string, SpotterOptionWithId>();

  getById(id: string): SpotterOption | null {
    if (!this.registry.has(id)) {
      return null;
    }

    const option = this.registry.get(id) as SpotterOptionWithId;
    delete option.id;

    return option;
  }

  register(options: SpotterOption[]): SpotterOptionWithId[] {
    const optionsWithIds: SpotterOptionWithId[] = options.map(option => ({ ...option, id: uuid() }));
    optionsWithIds.forEach((option) => this.registry.set(option.id, option));
    return optionsWithIds;
  }

  clear() {
    this.registry.clear()
  }

}
