import { NativeModules } from 'react-native';
import { SpotterStatusBar } from '../shared';

export default class StatusBar implements SpotterStatusBar {
  private statusBar = NativeModules.StatusBar;

  changeTitle(title: string) {
    this.statusBar.changeTitle(title);
  }

}
