import React from 'react';
import { AppRegistry, YellowBox } from 'react-native';
import { App } from './src/containers/spotter.tsx';
import { name as appName } from './app.json';
import { Settings } from './src/containers';
import { ThemeProvider, ApiProvider } from './src/components';

// TODO: Check
YellowBox.ignoreWarnings([
  'RCTBridge'
]);

const AppWithModules = () => (
  <ThemeProvider>
    <ApiProvider>
      <App/>
    </ApiProvider>
  </ThemeProvider>
);
const SettingsWithModules = () => (
  <ThemeProvider>
    <ApiProvider>
      <Settings/>
    </ApiProvider>
  </ThemeProvider>
);

AppRegistry.registerComponent(appName, () => AppWithModules);

AppRegistry.registerComponent('settings', () => SettingsWithModules);
