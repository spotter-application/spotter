import React, { FC } from 'react';
import { SpotterApi, SpotterRegistries, SpotterState } from '../core';
import {
  ApplicationsNative,
  ClipboardNative,
  GlobalHotkeyNative,
  NotificationsNative,
  StatusBarNative,
  StorageNative,
  ShellNative,
  PanelNative,
  BluetoothNative,
} from '../core/native';
import {
  PluginsRegistry,
  SettingsRegistry,
  HistoryRegistry,
} from '../core/registries';
import { State } from '../core/state';

const globalHotKey = new GlobalHotkeyNative();
const applications = new ApplicationsNative();
const storage = new StorageNative();
const notifications = new NotificationsNative();
const statusBar = new StatusBarNative();
const clipboard = new ClipboardNative();
const shell = new ShellNative();
const panel = new PanelNative();
const bluetooth = new BluetoothNative();

const api = {
  applications,
  storage,
  globalHotKey,
  notifications,
  statusBar,
  clipboard,
  shell,
  panel,
  bluetooth,
};

const history = new HistoryRegistry(api);
const plugins = new PluginsRegistry(api);
const settings = new SettingsRegistry(api);

const registries = {
  plugins,
  settings,
  history,
};

const state = new State(api, registries);

type Context = {
  api: SpotterApi,
  registries: SpotterRegistries,
  state: SpotterState,
};

export const ApiContext = React.createContext<Context>({
  api,
  registries,
  state,
});

export const ApiProvider: FC<{}> = (props) => {

  const value = {
    api,
    registries,
    state,
  };

  return (
    <ApiContext.Provider value={value}>
      {props.children}
    </ApiContext.Provider>
  );
};

export const useApi = () => React.useContext(ApiContext);
