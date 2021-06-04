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

// TODO:
let setQuery: (query: string) => void = () => null;

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
  query: {
    set value(value: string) {
      setQuery(value);
    }
  }
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

setQuery = (query: string) => {
  state.query = query;
};

type Context = {
  api: SpotterApi,
  registries: SpotterRegistries,
  state: SpotterState,
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
