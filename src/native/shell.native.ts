import { NativeModules } from 'react-native';
import { SpotterShell } from '../core';

export class ShellNative implements SpotterShell {
  private shell = NativeModules.Shell;

  async execute(command: string): Promise<string> {
    return await this.shell.execute(command);
  }

}
