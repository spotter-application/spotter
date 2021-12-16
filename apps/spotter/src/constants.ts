import { SpotterPlugin } from "../plugin";
import { PluginsManagerPlugin } from "./plugins/plugins-manager.plugin";
import { SpotterThemesPlugin } from "./plugins/themes.plugin";

export const SPOTTER_HOTKEY_IDENTIFIER = 'spotter';

export const PLUGINS_REGISTRY = 'PLUGINS_REGISTRY'

export const SHOW_OPTIONS_DELAY = 500;

export const PATH = 'export PATH="/usr/local/share/npm/bin:/usr/local/bin:/usr/local/sbin:~/bin:$PATH"';

// export const ALT_QUERY_KEY_MAP = {
//   '12': 'q',
//   '13': 'w',
//   '14': 'e',
//   '15': 'r',
//   '17': 't',
//   '16': 'y',
//   '32': 'u',
//   '34': 'i',
//   '31': 'o',
//   '35': 'p',
//   '0': 'a',
//   '1': 's',
//   '2': 'd',
//   '3': 'f',
//   '5': 'g',
//   '4': 'h',
//   '38': 'j',
//   '40': 'k',
//   '37': 'l',
//   '6': 'z',
//   '7': 'x',
//   '8': 'c',
//   '9': 'v',
//   '11': 'b',
//   '45': 'n',
//   '46': 'm',
//   '49': ' ',
//   '43': 'esc',
// };

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
