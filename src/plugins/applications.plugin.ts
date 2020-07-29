import { SpotterPlugin, SpotterApi, SpotterOption, SystemApplication, SystemApplicationDimensions } from '@spotter-app/core';
import { SpotterStorage } from '../core/native/storage.native';

const APPLICATION_POSITIONS_STORAGE_KEY = '@application-positions';

export default class Applications implements SpotterPlugin {
  private applications: SystemApplication[] = [];
  private storedApplicationDimensions: SystemApplicationDimensions[] | null = null;

  constructor(
    private api: SpotterApi,
    private storage: SpotterStorage,
  ) {
    this.init();
  }

  private async init() {
    this.applications = await this.api.getAllApplications();
    this.storedApplicationDimensions = await this.getApplicationDimensions();
  }

  query(query: string): SpotterOption[] {
    // TODO: q Spotify - quit Spotify

    return [
      ...this.applications.filter((o: SystemApplication) =>
        o.title.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map((app) => ({
          title: app.title,
          subtitle: app.path,
          image: '',
          action: () => this.api.openApplication(app.path),
          shortKey: ''
        })),
      ...this.actions.filter(action => action.title.toLocaleLowerCase().includes(query.toLocaleLowerCase())),
    ];
  }

  private get actions() {
    return [
      {
        title: 'Save application positions',
        subtitle: 'Save sizes and positions of all open applications',
        image: '',
        action: async () => {
          const dimensions = await this.api.getAllDimensions();
          this.saveApplicationDimensions(dimensions);
        }
      },
      ...(this.storedApplicationDimensions?.length ? [{
        title: 'Restore application positions',
        subtitle: 'Restore sizes and positions of all open applications',
        image: '',
        action: async () => {
          this.storedApplicationDimensions?.forEach(dimensions => {
            this.api.setDimensions(
              dimensions.appName,
              dimensions.x,
              dimensions.y,
              dimensions.width,
              dimensions.height,
            )
          })
        }
      }] : []),
    ]
  }

  private async saveApplicationDimensions(dimensions: SystemApplicationDimensions[]) {
    this.storedApplicationDimensions = dimensions;
    await this.storage.setItem(APPLICATION_POSITIONS_STORAGE_KEY, dimensions);
  }

  private async getApplicationDimensions() {
    return await this.storage.getItem<SystemApplicationDimensions[]>(APPLICATION_POSITIONS_STORAGE_KEY);
  }

}
