import {
  SpotterOption,
  SpotterPlugin,
  SpotterPluginLifecycle,
  spotterSearch,
} from '../../core';
import icon from './icon.png';

export class KillAppsPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  private options: SpotterOption[] = [];

  async onOpenSpotter() {
    this.options = await this.getOptions();
  }

  async onQuery(query: string): Promise<SpotterOption[]> {
    return spotterSearch(query, this.options, 'kill');
  }

  private async getOptions(): Promise<SpotterOption[]> {
    const options: SpotterOption[] = (await this.getRunningApps()).map(app => ({
      title: `kill ${app}`,
      subtitle: `Kill all instances of ${app} application`,
      image: icon,
      action: () => this.nativeModules.shell.execute(`killall ${app}`),
    }));

    return options;
  }

  private async getRunningApps(): Promise<string[]> {
    return await this.nativeModules.shell
      .execute("osascript -e 'tell application \"System Events\" to get name of (processes where background only is false)'")
      .then(r => r.split(', '))
  }
}
