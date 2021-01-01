import { NativeModules } from 'react-native';
import { SpotterStatusBar } from '../shared';

export class StatusBarNative implements SpotterStatusBar {
  private statusBar = NativeModules.StatusBar;

  changeTitle(title: string) {
    this.statusBar.changeTitle(title);
  }

}
