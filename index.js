import React from 'react';
import { AppRegistry, YellowBox } from 'react-native';
import { QueryPanel } from './src/components/spotter.component.tsx';
import { name as appName } from './app.json';
import { Settings } from './src/components/settings/settings.component.tsx';
import { ThemeProvider, ApiProvider, PluginsProvider } from './src/providers';

// TODO: Check
YellowBox.ignoreWarnings([
  'RCTBridge'
]);

const AppWithModules = () => (
  <ApiProvider>
    <PluginsProvider>
      <ThemeProvider>
        <QueryPanel/>
      </ThemeProvider>
    </PluginsProvider>
  </ApiProvider>
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
