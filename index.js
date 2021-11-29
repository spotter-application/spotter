import React from 'react';
import { AppRegistry, YellowBox } from 'react-native';
import { QueryPanel } from './src/components/spotter.component.tsx';
import { name as appName } from './app.json';
import { Settings } from './src/components/settings/settings.component.tsx';
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
    <StateProvider>
      <SettingsProvider>
        <PluginsProvider>
          <HistoryProvider>
            <StorageProvider>
              <EventsProvider>
                <ThemeProvider>
                  <QueryPanel />
                </ThemeProvider>
              </EventsProvider>
            </StorageProvider>
          </HistoryProvider>
        </PluginsProvider>
      </SettingsProvider>
    </StateProvider>
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
