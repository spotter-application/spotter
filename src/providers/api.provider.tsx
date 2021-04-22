import React, { FC } from 'react';
import { SpotterApi, SpotterRegistries } from '../core';
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
  State,
} from '../core/native';
import {
  PluginsRegistry,
  SettingsRegistry,
  HistoryRegistry,
} from '../core/registries';

const globalHotKey = new GlobalHotkeyNative();
const appsDimensions = new AppsDimensionsNative();
const storage = new StorageNative();
const notifications = new NotificationsNative();
const statusBar = new StatusBarNative();
const clipboard = new ClipboardNative();
const shell = new ShellNative();
const panel = new PanelNative();
const bluetooth = new BluetoothNative();
const state = new State();

const api = {
  appsDimensions,
  storage,
  globalHotKey,
  notifications,
  statusBar,
  clipboard,
  shell,
  panel,
  bluetooth,
  state,
};

const history = new HistoryRegistry(api);
const plugins = new PluginsRegistry(api, history);
const settings = new SettingsRegistry(api);

const registries = {
  plugins,
  settings,
  history,
};

type Context = {
  api: SpotterApi,
  registries: SpotterRegistries,
};

export const ApiContext = React.createContext<Context>({
  api,
  registries,
});

export const ApiProvider: FC<{}> = (props) => {

  const value = {
    api,
    registries,
  };

  return (
    <ApiContext.Provider value={value}>
      {props.children}
    </ApiContext.Provider>
  );
};

export const useApi = () => React.useContext(ApiContext);
