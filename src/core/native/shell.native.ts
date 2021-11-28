import { NativeModules } from 'react-native';
import { PATH } from '../constants';
import { SpotterShell } from '../interfaces';

export class ShellNative implements SpotterShell {
  private shell = NativeModules.Shell;

  async execute(command: string): Promise<string> {
    return await this.shell.execute(`${PATH} && ${command}`);
  }
}
