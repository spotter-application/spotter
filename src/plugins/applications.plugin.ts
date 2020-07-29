import { SpotterPlugin, SpotterApi, SpotterOption, SystemApplication } from '@spotter-app/core';

export default class Applications implements SpotterPlugin {
  private applications: SystemApplication[] = [];

  private temp: any[] = [];

  constructor(private api: SpotterApi) {
    this.init();
  }

  private async init() {
    this.applications = await this.api.getAllApplications();
  }

  query(query: string): SpotterOption[] {
    // TODO: q Spotify - quit Spotify

    return this.applications.filter((o: any) => o.title.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map((app) => ({
      title: app.title,
      subtitle: app.path,
      image: '',
      action: () => this.api.openApplication(app.path),
      shortKey: ''
    }));
  }

  get actions() {
    return [
      {
        title: 'Save application positions',
        subtitle: '',
        image: '',
        action: async () => {
          const d = await this.api.getAllDimensions();
          this.temp = d;
        }
      },
      {
        title: 'Restore application positions',
        subtitle: '',
        image: '',
        action: async () => {
          this.temp.forEach(dimensions => {
            this.api.setDimensions(
              dimensions.appName,
              dimensions.x,
              dimensions.y,
              dimensions.width,
              dimensions.height,
            )
          })
        }
      }
    ]
  }

}
