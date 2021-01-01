import { search } from '../core/helpers';
import {
  SpotterOption,
  SpotterPlugin,
  SpotterPluginLifecycle,
  SystemApplicationDimensions,
} from '../core/shared';

const APPLICATION_POSITIONS_STORAGE_KEY = '@application-positions';

export class AppsDimensionsPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  private storedApplicationDimensions: SystemApplicationDimensions[] | null = null;

  async onInit() {
    this.storedApplicationDimensions = await this.getApplicationDimensions();
  }

  onQuery(query: string): SpotterOption[] {
    return search(query, this.options);
  }

  private get options(): SpotterOption[] {
    return [
      {
        title: 'Save application positions',
        subtitle: 'Save sizes and positions of all open applications',
        image: '',
        action: async () => {
          const dimensions = await this.nativeModules.appsDimensions.getValue();
          this.saveApplicationDimensions(dimensions);
        }
      },
      ...(this.storedApplicationDimensions?.length ? [{
        title: 'Restore application positions',
        subtitle: 'Restore sizes and positions of all open applications',
        image: '',
        action: async () => {
          this.storedApplicationDimensions?.forEach(dimensions => {
            this.nativeModules.appsDimensions.setValue(
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
    await this.nativeModules.storage.setItem(APPLICATION_POSITIONS_STORAGE_KEY, dimensions);
  }

  private async getApplicationDimensions() {
    return await this.nativeModules.storage.getItem<SystemApplicationDimensions[]>(APPLICATION_POSITIONS_STORAGE_KEY);
  }

}
