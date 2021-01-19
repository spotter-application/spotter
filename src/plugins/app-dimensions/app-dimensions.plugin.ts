import {
  SpotterOptionBase,
  SpotterPlugin,
  SpotterPluginLifecycle,
  SystemApplicationDimensions,
  spotterSearch,
} from '../../core';
import icon from './icon.png';

const APPLICATION_POSITIONS_STORAGE_KEY = '@application-positions';

export class AppDimensionsPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  identifier = 'App Dimensions';

  private storedApplicationDimensions: SystemApplicationDimensions[] | null = null;

  async onInit() {
    this.storedApplicationDimensions = await this.getApplicationDimensions();
  }

  onQuery(query: string): SpotterOptionBase[] {
    return spotterSearch(query, this.options);
  }

  get options(): SpotterOptionBase[] {
    return [
      {
        title: 'Save application positions',
        subtitle: 'Save sizes and positions of all open applications',
        icon,
        action: async () => {
          const dimensions = await this.nativeModules.appsDimensions.getValue();
          this.saveApplicationDimensions(dimensions);
        }
      },
      ...(this.storedApplicationDimensions?.length ? [{
        title: 'Restore application positions',
        subtitle: 'Restore sizes and positions of all open applications',
        icon,
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
