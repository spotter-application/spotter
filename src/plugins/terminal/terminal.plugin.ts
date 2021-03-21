import {
  Application,
  getAllApplications,
  SpotterOption,
  SpotterPlugin,
  SpotterPluginLifecycle,
} from '../../core';

export class TerminalPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  identifier = 'Terminal';

  private app: Application | null = null;

  async onInit() {
    const apps = await getAllApplications(this.api.shell);
    this.app = apps.find(app => app.title === 'Terminal') ?? null;
  }

  async onQuery(query: string): Promise<SpotterOption[]> {
    if (!this.app || !query.length) {
      return [];
    }

    const [ prefixFromQuery, ...restQuery ] = query.split(' ');
    const command = restQuery.join(' ');

    if (!this.identifier.toLowerCase().includes(prefixFromQuery.toLowerCase())) {
      return [];
    }

    const options: SpotterOption[] = [
      {
        title: 'Execute and copy result to clipboard',
        icon: this.app.path,
        action: async () => {
          const result = await this.api.shell.execute(`${command}`);
          this.api.clipboard.setValue(result);
        },
        onQuery: async (_: string) => {
          const result = await this.api.shell.execute(`${command}`);
          console.log(result);
          return [
            {
              title: `${result.trim()}`,
              icon: this.app?.path,
              subtitle: 'Copy to clipboard',
              action: () => this.api.clipboard.setValue(result),
            }
          ];
        }
      }
    ];

    return options;
  }

}
