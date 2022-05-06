import { NativeModules } from 'react-native';
import { SpotterPanelApi } from '../../interfaces';

export class PanelApi implements SpotterPanelApi {
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
