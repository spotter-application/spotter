import React, { FC } from 'react';
import { SpotterApi } from '../core';
import {
  HotkeyApi,
  NotificationsApi,
  StatusBarApi,
  StorageApi,
  ShellApi,
  PanelApi,
} from '../core/native';

const hotkey = new HotkeyApi();
const storage = new StorageApi();
const notifications = new NotificationsApi();
const statusBar = new StatusBarApi();
const shell = new ShellApi();
const panel = new PanelApi();

const api = {
  storage,
  hotkey,
  notifications,
  statusBar,
  shell,
  panel,
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
