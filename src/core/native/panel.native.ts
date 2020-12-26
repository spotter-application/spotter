import { NativeEventEmitter, NativeModules } from 'react-native';

export default class Panel {

  private panel = NativeModules.Panel;

  private panelEventEmitter = new NativeEventEmitter(this.panel);

  toggle() {
    this.panel.toggle();
  }

  open() {
    this.panel.open();
  }

  close() {
    this.panel.close();
  }

  onEsc(callback: () => void) {
    this.panelEventEmitter.addListener('onEsc', callback);
  }

  onUpArrow(callback: () => void) {
    this.panelEventEmitter.addListener('onUpArrow', callback);
  }

  onDownArrow(callback: () => void) {
    this.panelEventEmitter.addListener('onDownArrow', callback);
  }

}
