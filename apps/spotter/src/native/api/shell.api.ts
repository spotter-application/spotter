import { NativeModules } from 'react-native';
import { PATH } from '../../constants';
import { SpotterShellApi } from '../../interfaces';

export class ShellApi implements SpotterShellApi {
  private shell = NativeModules.Shell;

  async execute(command: string): Promise<string> {
    return await this.shell.execute(`${PATH} && ${command}`);
  }
}
