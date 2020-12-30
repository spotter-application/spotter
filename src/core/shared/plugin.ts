import {
  SpotterApi,
  SpotterGlobalHotkey,
  SpotterNotifications,
  SpotterStatusBar,
  SpotterStorage,
} from "./interfaces";

export class SpotterPlugin {
  constructor(
    public api: SpotterApi,
    public storage: SpotterStorage,
    public globalHotKey: SpotterGlobalHotkey,
    public notifications: SpotterNotifications,
    public statusBar: SpotterStatusBar,
  ) {
    this.init()
  }

  init() {}
}
