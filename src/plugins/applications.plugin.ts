import { SpotterPlugin, SpotterApi, SpotterOption, SystemApplication } from '@spotter-app/core';

export default class Applications implements SpotterPlugin {
  private applications: SystemApplication[] = [];

  constructor(private api: SpotterApi) {
    this.init();
  }

  private async init() {
    this.applications = await this.api.getAllApplications();
  }

  query(query: string): SpotterOption[] {
    return this.applications.filter((o: any) => o.title.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map((app) => ({
      title: app.title,
      subtitle: app.path,
      image: '',
      action: () => this.api.openApplication(app.path),
      shortKey: ''
    }));
  }

}
