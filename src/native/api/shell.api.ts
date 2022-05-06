import { NativeModules } from 'react-native';
import { SpotterShellApi } from '../../interfaces';

const PATH = 'export PATH="/usr/local/share/npm/bin:/usr/local/bin:/usr/local/sbin:~/bin:$PATH"';

export class ShellApi implements SpotterShellApi {
  private shell = NativeModules.Shell;

  async execute(command: string): Promise<string> {
    return await this.shell.execute(`${PATH} && ${command}`);
  }
}
