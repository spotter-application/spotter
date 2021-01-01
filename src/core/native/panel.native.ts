import { NativeModules } from 'react-native';
import { SpotterPanel } from '../shared';

export class Panel implements SpotterPanel {

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

}
