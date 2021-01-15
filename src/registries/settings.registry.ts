import { SpotterNativeModules, SpotterSettings, SpotterSettingsRegistry } from '../core';

export class SettingsRegistry implements SpotterSettingsRegistry {
  private nativeModules: SpotterNativeModules;
  private STORAGE_KEY = 'STORAGE_KEY';
  private defaultValue: SpotterSettings = {
    hotkey: { doubledModifiers: true, keyCode: 0, modifiers: 512 },
    pluginHotkeys: {},
  }

  constructor(nativeModules: SpotterNativeModules) {
    this.nativeModules = nativeModules;
  }

  async getSettings(): Promise<SpotterSettings> {
    const settings = await this.nativeModules.storage.getItem<SpotterSettings>(this.STORAGE_KEY);
    return settings ?? this.defaultValue;
  }

  async patchSettings(settings: Partial<SpotterSettings>) {
    const currentValue = await this.getSettings();
    this.nativeModules.storage.setItem(this.STORAGE_KEY, { ...currentValue, ...settings });
  }

}

