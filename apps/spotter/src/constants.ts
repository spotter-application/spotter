import { SpotterPlugin } from "@spotter-app/core";
import { PluginsManagerPlugin } from "./plugins/plugins-manager.plugin";
import { SpotterThemesPlugin } from "./plugins/themes.plugin";

export const PLUGINS_STORAGE_KEY = 'PLUGINS_0.2';

export const SPOTTER_HOTKEY_IDENTIFIER = 'spotter';

export const PLUGINS_REGISTRY = 'PLUGINS_REGISTRY'

export const SHOW_OPTIONS_DELAY = 500;

export const PATH = 'export PATH="/usr/local/share/npm/bin:/usr/local/bin:/usr/local/sbin:~/bin:$PATH"';

export const LIGHT_THEME = '#efefef,#101010,#dddddd,#000000,#0f60cf,#fefefe';
export const DARK_THEME = '#212121,#ffffff,#3c3c3c,#ffffff,#0f60cf,#fefefe';

export const PLUGINS_TO_INSTALL = [
  '@spotter-app/applications-plugin',
  '@spotter-app/bluetooth-plugin',
  '@spotter-app/brave-plugin',
  '@spotter-app/calculator-plugin',
  '@spotter-app/emoji-plugin',
  '@spotter-app/spotify-plugin',
  '@spotter-app/vscode-plugin',
  '@spotter-app/web-plugin',
];

export const INTERNAL_PLUGINS: {[plugin: string]: typeof SpotterPlugin} = {
  ['plugins-manager']: PluginsManagerPlugin,
  ['spotter-themes']: SpotterThemesPlugin,
}
