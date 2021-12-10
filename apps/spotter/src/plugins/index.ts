import { SpotterPlugin } from '@spotter-app/core';
import { PluginsManager } from './plugin-manager.plugin';

export const INTERNAL_PLUGINS: {[plugin: string]: typeof SpotterPlugin} = {
  ['plugins-manager']: PluginsManager,
}
