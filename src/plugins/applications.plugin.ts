import SpotterSearch from '../core/search';
import {
  SpotterOption,
  SpotterPlugin,
  SpotterPluginLifecycle,
  SystemApplication,
  SystemApplicationDimensions,
} from '../core/shared';

const APPLICATION_POSITIONS_STORAGE_KEY = '@application-positions';

export class Applications extends SpotterPlugin implements SpotterPluginLifecycle {
  private options: SpotterOption[] = [];
  private storedApplicationDimensions: SystemApplicationDimensions[] | null = null;
  private searcherWithOptions: SpotterSearch | null = null;

  async onInit() {
    this.options = (await this.nativeModules.api.getAllApplications()).map((application: SystemApplication) => ({
      title: application.title,
      subtitle: application.path,
      image: '',
      action: () => this.nativeModules.api.shellCommand(`open "${application.path}"`),
      shortKey: ''
    }));

    this.storedApplicationDimensions = await this.getApplicationDimensions();
    this.searcherWithOptions = new SpotterSearch([...this.systemApps, ...this.options, ...this.actions]);
  }

  onQuery(query: string): SpotterOption[] {
    if (!this.searcherWithOptions) {
      return [];
    }

    return this.searcherWithOptions.search(query);
  }

  // TODO: Figure out why it's not there from getAllApplications
  private get systemApps(): SpotterOption[] {
    return [
      {
        title: 'Calculator',
        subtitle: '/Applications/Calculator.app',
        image: '',
        action: () => this.nativeModules.api.shellCommand("osascript -e 'tell application \"Calculator\" to activate'"),
      },
      {
        title: 'Calendar',
        subtitle: '/Applications/Calendar.app',
        image: '',
        action: () => this.nativeModules.api.shellCommand("osascript -e 'tell application \"Calendar\" to activate'"),
      },
      {
        title: 'App Store',
        subtitle: '/Applications/App Store.app',
        image: '',
        action: () => this.nativeModules.api.shellCommand("osascript -e 'tell application \"App Store\" to activate'"),
      },
      {
        title: 'Notes',
        subtitle: '/Applications/Notes.app',
        image: '',
        action: () => this.nativeModules.api.shellCommand("osascript -e 'tell application \"Notes\" to activate'"),
      },
      {
        title: 'Photos',
        subtitle: '/Applications/Photos.app',
        image: '',
        action: () => this.nativeModules.api.shellCommand("osascript -e 'tell application \"Photos\" to activate'"),
      },
      {
        title: 'Books',
        subtitle: '/Applications/Books.app',
        image: '',
        action: () => this.nativeModules.api.shellCommand("osascript -e 'tell application \"Books\" to activate'"),
      },
      {
        title: 'Music',
        subtitle: '/Applications/Music.app',
        image: '',
        action: () => this.nativeModules.api.shellCommand("osascript -e 'tell application \"Music\" to activate'"),
      },
      {
        title: 'Mail',
        subtitle: '/Applications/Mail.app',
        image: '',
        action: () => this.nativeModules.api.shellCommand("osascript -e 'tell application \"Mail\" to activate'"),
      },
      {
        title: 'Messages',
        subtitle: '/Applications/Messages.app',
        image: '',
        action: () => this.nativeModules.api.shellCommand("osascript -e 'tell application \"Messages\" to activate'"),
      },
      {
        title: 'Reminders',
        subtitle: '/Applications/Reminders.app',
        image: '',
        action: () => this.nativeModules.api.shellCommand("osascript -e 'tell application \"Reminders\" to activate'"),
      },
      {
        title: 'Stickers',
        subtitle: '/Applications/Stickers.app',
        image: '',
        action: () => this.nativeModules.api.shellCommand("osascript -e 'tell application \"Stickers\" to activate'"),
      },
      {
        title: 'System Preferences',
        subtitle: '/Applications/System Preferences.app',
        image: '',
        action: () => this.nativeModules.api.shellCommand("osascript -e 'tell application \"System Preferences\" to activate'"),
      },
    ]
  }

  // TODO: Move to own plugin
  private get actions() {
    return [
      {
        title: 'Save application positions',
        subtitle: 'Save sizes and positions of all open applications',
        image: '',
        action: async () => {
          const dimensions = await this.nativeModules.api.getAllDimensions();
          this.saveApplicationDimensions(dimensions);
        }
      },
      ...(this.storedApplicationDimensions?.length ? [{
        title: 'Restore application positions',
        subtitle: 'Restore sizes and positions of all open applications',
        image: '',
        action: async () => {
          this.storedApplicationDimensions?.forEach(dimensions => {
            this.nativeModules.api.setDimensions(
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
