import {
  getAllApplications,
  SpotterOption,
  SpotterPlugin,
  SpotterPluginLifecycle,
  spotterSearch,
} from '../../core';

export class ApplicationsPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  identifier = 'Applications'

  private applications: SpotterOption[] = [];
  private runnedApps: string[] = [];

  async onOpenSpotter() {
    const apps = await getAllApplications(this.api.shell);
    this.applications = apps.map(app => ({
      title: app.title,
      icon: app.path,
      action: async () => await this.api.shell.execute(`open "${app.path}"`),
      onQuery: (q: string) => {
        const runnedApp = !!this.runnedApps.find(a => a === app.title);
        const runnedAppOptions: SpotterOption[] = [
          {
            title: 'Close',
            icon: app.path,
            subtitle: `Kill all instances of ${app.title}`,
            action: () => this.api.shell.execute(`killall "${app.title}"`),
          },
          {
            title: 'Reopen',
            icon: app.path,
            subtitle: `Close and open ${app.title}`,
            action: () => this.api.shell.execute(`killall "${app.title}" && open "${app.path}"`),
          },
        ];

        const options = [
          {
            title: runnedApp ? 'Show' : 'Open',
            icon: app.path,
            action: async () => await this.api.shell.execute(`open "${app.path}"`),
          },
          ...(runnedApp ? runnedAppOptions : []),
        ];

        return q.length
          ? spotterSearch(q, options)
          : options;
      }
    }));
    this.runnedApps = await this.getRunnedApps();
  }

  onQuery(query: string): SpotterOption[] {
    return spotterSearch(query, this.applications, this.identifier);
  }

  private async getRunnedApps(): Promise<string[]> {
    return await this.api.shell
      .execute("osascript -e 'tell application \"System Events\" to get name of (processes where background only is false)'")
      .then(r => r.split(', '))
  }

}
