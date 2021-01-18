import {
  getAllApplications,
  SpotterOption,
  SpotterPlugin,
  SpotterPluginLifecycle,
  spotterSearch,
} from '../../core';

export class ApplicationsPlugin extends SpotterPlugin implements SpotterPluginLifecycle {
  private applications: SpotterOption[] = [];

  async onOpenSpotter() {
    const apps = await getAllApplications(this.nativeModules.shell);
    this.applications = apps.map(app => ({
      title: app.title,
      subtitle: app.path,
      icon: app.path,
      action: async () => await this.nativeModules.shell.execute(`open "${app.path}"`),
    }));
  }

  onQuery(query: string): SpotterOption[] {
    return spotterSearch(query, this.applications);
  }

}
