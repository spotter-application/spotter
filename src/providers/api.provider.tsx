import React, { FC } from 'react';
import { SpotterApi, SpotterRegistries } from '../core';
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

type Context = {
  api: SpotterApi,
  registries: SpotterRegistries,
};

export enum SpotterCommands {
  setStorageItem = 'SET_STORAGE_ITEM',
  getStorageItem = 'GET_STORAGE_ITEM',
}

function execCommand<T>(command: SpotterCommands.getStorageItem, data: string): Promise<T>;
function execCommand(command: SpotterCommands.setStorageItem, data: { key: string, value: string }): void;
function execCommand(command: SpotterCommands, data: any) {

  switch (command) {
    case SpotterCommands.getStorageItem:
      return api.storage.getItem(data);
    case SpotterCommands.setStorageItem:
      return api.storage.setItem(data.key, data.value);
    default:
      break;
  }

}

// const result = execCommand<string>(SpotterCommands.getStorageItem, 'test');

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
