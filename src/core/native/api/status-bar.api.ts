import { NativeModules } from 'react-native';
import { SpotterStatusBarApi } from '../../interfaces';

export class StatusBarApi implements SpotterStatusBarApi {
  private statusBar = NativeModules.StatusBar;

  changeTitle(title: string) {
    this.statusBar.changeTitle(title);
  }
}
