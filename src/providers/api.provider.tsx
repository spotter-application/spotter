import React, { FC } from 'react';
import {
  SpotterHotkeyApi,
  SpotterNotificationsApi,
  SpotterPanelApi,
  SpotterShellApi,
  SpotterStatusBarApi,
  SpotterStorageApi,
  SpotterXCallbackUrlApi,
} from '../interfaces';
import {
  HotkeyApi,
  NotificationsApi,
  StatusBarApi,
  StorageApi,
  ShellApi,
  PanelApi,
  XCallbackUrl,
} from '../native';

const hotkey = new HotkeyApi();
const storage = new StorageApi();
const notifications = new NotificationsApi();
const statusBar = new StatusBarApi();
const shell = new ShellApi();
const panel = new PanelApi();
const xCallbackUrlApi = new XCallbackUrl();

type Context = {
  storage: SpotterStorageApi,
  hotkey: SpotterHotkeyApi,
  notifications: SpotterNotificationsApi,
  statusBar: SpotterStatusBarApi,
  shell: SpotterShellApi,
  panel: SpotterPanelApi,
  xCallbackUrlApi: SpotterXCallbackUrlApi,
};

const api = {
  storage,
  hotkey,
  notifications,
  statusBar,
  shell,
  panel,
  xCallbackUrlApi,
};

export const ApiContext = React.createContext<Context>(api);

export const ApiProvider: FC<{}> = (props) => {

  return (
    <ApiContext.Provider value={api}>
      {props.children}
    </ApiContext.Provider>
  );
};

export const useApi = () => React.useContext(ApiContext);
