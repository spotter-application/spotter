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
    if (query === 'pos') {
      return [{
        title: 'Change position',
        subtitle: '',
        image: '',
        action: () => this.api.setDimensions('Terminal', 5, 5, 500, 500)
      }]
    }
    // TODO: q Spotify - quit Spotify

    return this.applications.filter((o: any) => o.title.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map((app) => ({
      title: app.title,
      subtitle: app.path,
      image: '',
      action: () => this.api.openApplication(app.path),
      shortKey: ''
    }));
  }

}
