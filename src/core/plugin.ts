import { Settings } from '../providers/settings.provider';
import { SpotterApi } from './interfaces';

export class InternalPlugin {
  constructor(
    public api: SpotterApi,
    public getSettings: () => Promise<Settings>,
    public registerPlugin: (plugin: string) => void,
    public unregisterPlugin: (plugin: string) => void,
  ) {}
}
