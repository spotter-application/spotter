import {
  SpotterOptionBase,
  SpotterPlugin,
  SpotterPluginLifecycle,
  spotterSearch,
} from '../../core';
import icon from './icon.png';

export class SystemCommandsPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  identifier = 'System Commands';

  onQuery(query: string): SpotterOptionBase[] {
    return spotterSearch(query, this.options);
  }

  get options(): SpotterOptionBase[] {
    return [
      {
        title: 'Shutdown',
        subtitle: 'Shut down the computer',
        icon,
        action: () => this.shutdown(),
      },
      {
        title: 'Restart',
        subtitle: 'Restart the computer',
        icon,
        action: () => this.restart(),
      },
      {
        title: 'Logout',
        subtitle: 'Logout the current user',
        icon,
        action: () => this.logout(),
      },
      {
        title: 'Sleep',
        subtitle: 'Sleep the computer',
        icon,
        action: () => this.sleep(),
      },
    ];
  }

  private async shutdown() {
    await this.nativeModules.shell.execute("osascript -e 'tell app \"System Events\" to shut down'")
  }

  private async restart() {
    await this.nativeModules.shell.execute("osascript -e 'tell app \"System Events\" to restart'")
  }

  private async logout() {
    await this.nativeModules.shell.execute("osascript -e 'tell app \"System Events\" to log out")
  }

  private async sleep() {
    await this.nativeModules.shell.execute("osascript -e 'tell app \"System Events\" to sleep'")
  }
}
