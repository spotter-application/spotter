import React from 'react';
import { AppRegistry, YellowBox } from 'react-native';
import { App } from './src/containers/spotter.tsx';
import { name as appName } from './app.json';
import { Settings } from './src/containers';
import {
  AppsDimensionsNative,
  ClipboardNative,
  GlobalHotkeyNative,
  NotificationsNative,
  StatusBarNative,
  StorageNative,
  ShellNative,
  PanelNative,
  BluetoothNative,
} from './src/native';
import {
  PluginsRegistry,
  SettingsRegistry,
  HistoryRegistry,
} from './src/registries';
import { ThemeProvider } from './src/components';

// TODO: Check
YellowBox.ignoreWarnings([
  'RCTBridge'
]);

const globalHotKey = new GlobalHotkeyNative();
const appsDimensions = new AppsDimensionsNative();
const storage = new StorageNative();
const notifications = new NotificationsNative();
const statusBar = new StatusBarNative();
const clipboard = new ClipboardNative();
const shell = new ShellNative();
const panel = new PanelNative();
const bluetooth = new BluetoothNative();

const nativeModules = {
  appsDimensions,
  storage,
  globalHotKey,
  notifications,
  statusBar,
  clipboard,
  shell,
  panel,
  bluetooth,
};

const plugins = new PluginsRegistry(nativeModules);
const settings = new SettingsRegistry(nativeModules);
const history = new HistoryRegistry(nativeModules);

const registries = {
  plugins,
  settings,
  history,
};

const AppWithModules = () => (
  <ThemeProvider>
    <App nativeModules={nativeModules} registries={registries}/>
  </ThemeProvider>
);
const SettingsWithModules = () => (
  <ThemeProvider>
    <Settings nativeModules={nativeModules} registries={registries}/>
  </ThemeProvider>
);

AppRegistry.registerComponent(appName, () => AppWithModules);

AppRegistry.registerComponent('settings', () => SettingsWithModules);
