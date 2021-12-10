import React from 'react';
import { AppRegistry, YellowBox } from 'react-native';
import { QueryPanel } from './src/components/queryPanel/queryPanel.tsx';
import { name as appName } from './app.json';
import { Settings } from './src/components/settings/settings.tsx';
import {
  ThemeProvider,
  ApiProvider,
  EventsProvider,
  SettingsProvider,
  HistoryProvider,
  StorageProvider,
  StateProvider,
  PluginsProvider,
} from './src/providers';

const AppWithModules = () => (
  <ApiProvider>
    <StorageProvider>
      <HistoryProvider>
        <SettingsProvider>
          <StateProvider>
            <PluginsProvider>
              <EventsProvider>
                <ThemeProvider>
                  <QueryPanel />
                </ThemeProvider>
              </EventsProvider>
            </PluginsProvider>
          </StateProvider>
        </SettingsProvider>
      </HistoryProvider>
    </StorageProvider>
  </ApiProvider>
);
const SettingsWithModules = () => (
  <ApiProvider>
    <SettingsProvider>
      {/* <EventsProvider> */}
        <ThemeProvider>
          <Settings />
        </ThemeProvider>
      {/* </EventsProvider> */}
    </SettingsProvider>
  </ApiProvider>
);

AppRegistry.registerComponent(appName, () => AppWithModules);

AppRegistry.registerComponent('settings', () => SettingsWithModules);
