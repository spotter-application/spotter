import { AppRegistry } from 'react-native';
import App from './src/spotter.tsx';
import { name as appName } from './app.json';
import { Settings } from './src/settings';

AppRegistry.registerComponent(appName, () => App);

AppRegistry.registerComponent('settings', () => Settings);
