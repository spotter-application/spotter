import { SpotterPlugin } from '@spotter-app/core';
import { PluginsManagerPlugin } from './plugin-manager.plugin';
import { SpotterThemesPlugin } from './themes.plugin';

export const INTERNAL_PLUGINS: {[plugin: string]: typeof SpotterPlugin} = {
  ['plugins-manager']: PluginsManagerPlugin,
  ['spotter-themes']: SpotterThemesPlugin,
}
