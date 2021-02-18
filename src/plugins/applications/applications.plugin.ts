import {
  getAllApplications,
  SpotterOptionBase,
  SpotterPlugin,
  SpotterPluginLifecycle,
  spotterSearch,
} from '../../core';

export class ApplicationsPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  identifier = 'Applications'

  private applications: SpotterOptionBase[] = [];

  async onOpenSpotter() {
    const apps = await getAllApplications(this.nativeModules.shell);
    this.applications = apps.map(app => ({
      title: app.title,
      icon: app.path,
      action: async () => await this.nativeModules.shell.execute(`open "${app.path}"`),
    }));
  }

  onQuery(query: string): SpotterOptionBase[] {
    return spotterSearch(query, this.applications, this.identifier);
  }

}
