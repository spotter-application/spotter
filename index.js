import React from 'react';
import { AppRegistry, YellowBox } from 'react-native';
import { QueryPanel } from './src/index.tsx';
import { name as appName } from './app.json';
import { Settings } from './src/settings/settings.tsx';
import {
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
                <QueryPanel />
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
        <Settings />
      {/* </EventsProvider> */}
    </SettingsProvider>
  </ApiProvider>
);

AppRegistry.registerComponent(appName, () => AppWithModules);

AppRegistry.registerComponent('settings', () => SettingsWithModules);
