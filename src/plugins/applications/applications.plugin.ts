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
  private runningApps: string[] = [];

  async onOpenSpotter() {
    // const runningList = await this.api.applications.getRunningList();
    this.runningApps = await this.api.applications.getRunningList();

    console.log('runningList: ', this.runningApps);

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

  onQuery(query: string): SpotterOption[] {
    console.log('ApplicationsPlugin query: ', query, query.length)
    if (!query?.length) {
      return this.runningApps.map(title => ({
        title,
      }))
    }

    return spotterSearch(query, this.applications, this.identifier);
  }

}
