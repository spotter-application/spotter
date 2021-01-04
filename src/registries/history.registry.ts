import { SpotterHistory, SpotterHistoryRegistry, SpotterNativeModules } from '../core';

export class HistoryRegistry implements SpotterHistoryRegistry {
  private nativeModules: SpotterNativeModules;
  private STORAGE_KEY = 'SPOTTER_HISTORY';
  private defaultValue: SpotterHistory = {};

  constructor(nativeModules: SpotterNativeModules) {
    this.nativeModules = nativeModules;
  }

  async getHistory(): Promise<SpotterHistory> {
    const history = await this.nativeModules.storage.getItem<SpotterHistory>(this.STORAGE_KEY);
    return history ?? this.defaultValue;
  }

  async patchHistory(history: Partial<SpotterHistory>) {
    const currentValue = await this.getHistory();
    this.nativeModules.storage.setItem(this.STORAGE_KEY, { ...currentValue, ...history });
  }

}
