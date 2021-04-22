import React from 'react';
import { AppRegistry, YellowBox } from 'react-native';
import { QueryPanel } from './src/query-panel/query-panel.tsx';
import { name as appName } from './app.json';
import { Settings } from './src/settings/settings.tsx';
import { ThemeProvider, ApiProvider } from './src/providers';

// TODO: Check
YellowBox.ignoreWarnings([
  'RCTBridge'
]);

const AppWithModules = () => (
  <ThemeProvider>
    <ApiProvider>
      <QueryPanel/>
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
