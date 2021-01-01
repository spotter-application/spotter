import { NativeModules } from 'react-native';
import { SpotterClipboard } from '../shared';

export class ClipboardNative implements SpotterClipboard {
  private clipboard = NativeModules.NativeClipboard;

  setValue(value: string) {
    this.clipboard.setValue(value);
  }

  async getValue(): Promise<string> {
    return await this.clipboard.getValue();
  }

}
