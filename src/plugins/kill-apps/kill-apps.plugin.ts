import {
  SpotterOption,
  SpotterPlugin,
  SpotterPluginLifecycle,
  spotterSearch,
} from '../../core';
import icon from './icon.png';

export class KillAppsPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  identifier = 'Kill Apps';

  private killOptions: SpotterOption[] = [];
  private reopenOptions: SpotterOption[] = [];

  async onOpenSpotter() {
    const runningApps = await this.getRunningApps();
    this.killOptions = this.getKillOptions(runningApps);
    this.reopenOptions = this.getReopenOptions(runningApps);
  }

  onQuery(query: string): SpotterOption[] {
    return [
      ...spotterSearch(query, this.killOptions, this.identifier),
      ...spotterSearch(query, this.reopenOptions, this.identifier),
    ];
  }

  private getKillOptions(runningApps: string[]): SpotterOption[] {
    return runningApps.map(app => ({
      title: `kill ${app}`,
      subtitle: `Kill all instances of ${app} application`,
      icon,
      action: () => this.nativeModules.shell.execute(`killall "${app}"`),
    }));
  }

  private getReopenOptions(runningApps: string[]): SpotterOption[] {
    return runningApps.map(app => ({
      title: `reopen ${app}`,
      subtitle: `Kill and open ${app}`,
      icon,
      action: () => this.nativeModules.shell.execute(`killall "${app}" && open -a "${app}"`),
    }));
  }

  private async getRunningApps(): Promise<string[]> {
    return await this.nativeModules.shell
      .execute("osascript -e 'tell application \"System Events\" to get name of (processes where background only is false)'")
      .then(r => r.split(', '))
  }
}
