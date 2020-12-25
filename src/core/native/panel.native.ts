import {
  NativeModules,
} from 'react-native';

export default class Panel {
  private panel = NativeModules.Panel;

  toggle() {
    this.panel.toggle();
  }

}
