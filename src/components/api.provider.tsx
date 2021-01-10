
import React, { FC } from 'react';
import { SpotterNativeModules, SpotterRegistries } from '../core';
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
} from '../native';
import {
  PluginsRegistry,
  SettingsRegistry,
  HistoryRegistry,
} from '../registries';

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

type Context = {
  nativeModules: SpotterNativeModules,
  registries: SpotterRegistries,
};

export const ApiContext = React.createContext<Context>({
  nativeModules,
  registries,
});

export const ApiProvider: FC<{}> = (props) => {

  const api = {
    nativeModules,
    registries,
  };

  return (
    <ApiContext.Provider value={api}>
      {props.children}
    </ApiContext.Provider>
  );
};

export const useApi = () => React.useContext(ApiContext);
