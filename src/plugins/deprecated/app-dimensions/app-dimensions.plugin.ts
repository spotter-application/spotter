import {
  SpotterOption,
  InternalPlugin,
  InternalPluginLifecycle,
  SystemApplicationDimensions,
  spotterSearch,
} from '../../../core';
import icon from './icon.png';

const APPLICATION_POSITIONS_STORAGE_KEY = '@application-positions';

export class AppDimensionsPlugin extends InternalPlugin implements InternalPluginLifecycle {

  identifier = 'App Dimensions';

  private storedApplicationDimensions: SystemApplicationDimensions[] | null = null;

  async onInit() {
    this.storedApplicationDimensions = await this.getApplicationDimensions();
  }

  onQuery(query: string): SpotterOption[] {
    return spotterSearch(query, this.options, this.identifier);
  }

  get options(): SpotterOption[] {
    return [
      {
        title: 'Save application positions',
        subtitle: 'Save sizes and positions of all open applications',
        icon,
        action: async () => {
          const dimensions = await this.api.appsDimensions.getValue();
          this.saveApplicationDimensions(dimensions);
        }
      },
      ...(this.storedApplicationDimensions?.length ? [{
        title: 'Restore application positions',
        subtitle: 'Restore sizes and positions of all open applications',
        icon,
        action: async () => {
          this.storedApplicationDimensions?.forEach(dimensions => {
            this.api.appsDimensions.setValue(
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
    await this.api.storage.setItem(APPLICATION_POSITIONS_STORAGE_KEY, dimensions);
  }

  private async getApplicationDimensions() {
    return await this.api.storage.getItem<SystemApplicationDimensions[]>(APPLICATION_POSITIONS_STORAGE_KEY);
  }

}
