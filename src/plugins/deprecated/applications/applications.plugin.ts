import {
  getAllApplications,
  SpotterOption,
  InternalPlugin,
  InternalPluginLifecycle,
  spotterSearch,
} from '../../../core';

export class ApplicationsPlugin extends InternalPlugin implements InternalPluginLifecycle {

  identifier = 'Applications'

  private applications: SpotterOption[] = [];
  private runningApps: string[] = [];

  async onOpenSpotter() {
    this.runningApps = await this.api.applications.getRunningList();

    const apps = await getAllApplications(this.api.shell);
    this.applications = apps.map(app => ({
      title: app.title,
      icon: app.path,
      action: async () => await this.api.shell.execute(`open "${app.path}"`),
      onQuery: (q: string) => {
        const runningApp = !!this.runningApps.find(a => a === app.title);
        const runningAppOptions: SpotterOption[] = [
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
            title: runningApp ? 'Show' : 'Open',
            icon: app.path,
            action: async () => await this.api.shell.execute(`open "${app.path}"`),
          },
          ...(runningApp ? runningAppOptions : []),
        ];

        return q.length
          ? spotterSearch(q, options)
          : options;
      }
    }));
  }

  async onQuery(query: string): Promise<SpotterOption[]> {
    return spotterSearch(query, this.applications, this.identifier);
  }

}
