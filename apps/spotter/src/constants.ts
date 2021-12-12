import { SpotterThemeColors } from "./interfaces";

export const SPOTTER_HOTKEY_IDENTIFIER = 'spotter';

export const PLUGINS_REGISTRY = 'PLUGINS_REGISTRY'

export const SHOW_OPTIONS_DELAY = 500;

export const PATH = 'export PATH="/usr/local/share/npm/bin:/usr/local/bin:/usr/local/sbin:~/bin:$PATH"';

export const SYSTEM_PLUGINS_LIST = [
  'spotter-plugins-plugin',
  'spotter-applications-plugin',
];

export const ALT_QUERY_KEY_MAP = {
  '12': 'q',
  '13': 'w',
  '14': 'e',
  '15': 'r',
  '17': 't',
  '16': 'y',
  '32': 'u',
  '34': 'i',
  '31': 'o',
  '35': 'p',
  '0': 'a',
  '1': 's',
  '2': 'd',
  '3': 'f',
  '5': 'g',
  '4': 'h',
  '38': 'j',
  '40': 'k',
  '37': 'l',
  '6': 'z',
  '7': 'x',
  '8': 'c',
  '9': 'v',
  '11': 'b',
  '45': 'n',
  '46': 'm',
  '49': ' ',
  '43': 'esc',
};

// export const LIGHT_THEME: SpotterThemeColors = {
//   background: '#efefef',
//   text: '#101010',
//   activeOptionBackground: '#dddddd',
//   activeOptionText: '#000000',
//   hoveredOptionBackground: '#0f60cf',
//   hoveredOptionText: '#fefefe',
// };
export const LIGHT_THEME = '#efefef,#101010,#dddddd,#000000,#0f60cf,#fefefe';
export const DARK_THEME = '#212121,#ffffff,#3c3c3c,#ffffff,#0f60cf,#fefefe';

// export const DARK_THEME: SpotterThemeColors = {
//   background: '#212121',
//   text: '#ffffff',
//   activeOptionBackground: '#3c3c3c',
//   activeOptionText: '#ffffff',
//   hoveredOptionBackground: '#0f60cf',
//   hoveredOptionText: '#fefefe',
// };
