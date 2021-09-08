import React, { FC } from 'react';
import { SpotterApi } from '../core';
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

type Context = {
  api: SpotterApi,
};

export const ApiContext = React.createContext<Context>({
  api,
});

export const ApiProvider: FC<{}> = (props) => {

  const value = {
    api,
  };

  return (
    <ApiContext.Provider value={value}>
      {props.children}
    </ApiContext.Provider>
  );
};

export const useApi = () => React.useContext(ApiContext);
