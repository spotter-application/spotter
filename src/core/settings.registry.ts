import { StorageNative } from './native';
import { SpotterSettings } from './shared';

export class SettingsRegistry {
  private storage = new StorageNative();
  private SETTINGS_KEY = 'SPOTTER_SETTINGS';

  async getSettings(): Promise<SpotterSettings> {
    const settings = await this.storage.getItem<SpotterSettings>(this.SETTINGS_KEY);
    return settings ?? { hotkey: { doubledModifiers: true, keyCode: 0, modifiers: 512 } }
  }

  async patchSettings(settings: Partial<SpotterSettings>) {
    const currentSettings = await this.getSettings();
    this.storage.setItem(this.SETTINGS_KEY, { ...currentSettings, ...settings });
  }

}
