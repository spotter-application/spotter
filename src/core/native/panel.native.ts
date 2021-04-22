import { NativeModules } from 'react-native';
import { SpotterPanel } from '..';

export class PanelNative implements SpotterPanel {

  private panel = NativeModules.Panel;

  toggle() {
    this.panel.toggle();
  }

  open() {
    this.panel.open();
  }

  close() {
    this.panel.close();
  }

  openSettings() {
    this.panel.openSettings();
  }

}
