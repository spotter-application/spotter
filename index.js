import React from 'react';
import { AppRegistry } from 'react-native';
import App from './src/spotter.tsx';
import { name as appName } from './app.json';
import { Settings } from './src/settings';
import {
  AppsDimensionsNative,
  ClipboardNative,
  GlobalHotkeyNative,
  NotificationsNative,
  StatusBarNative,
  StorageNative,
  ShellNative,
  PanelNative,
} from './src/core/native';
import { YellowBox } from 'react-native';

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

const nativeModules = {
  appsDimensions,
  storage,
  globalHotKey,
  notifications,
  statusBar,
  clipboard,
  shell,
  panel,
};

const AppWithModules = () => (<App nativeModules={nativeModules}/>);
const SettingsWithModules = () => (<Settings nativeModules={nativeModules}/>);

AppRegistry.registerComponent(appName, () => AppWithModules);

AppRegistry.registerComponent('settings', () => SettingsWithModules);
