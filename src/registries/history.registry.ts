import { SpotterHistory, SpotterHistoryRegistry, SpotterApi } from '../core';

export class HistoryRegistry implements SpotterHistoryRegistry {
  private nativeModules: SpotterApi;
  private PLUGIN_HISTORY_STORAGE_KEY = 'PLUGIN_HISTORY_STORAGE_KEY_v1';
  private OPTIONS_HISTORY_STORAGE_KEY = 'OPTIONS_HISTYRY_STORAGE_KEY_v1';
  private defaultValue: SpotterHistory = {};

  constructor(nativeModules: SpotterApi) {
    this.nativeModules = nativeModules;
  }

  async getPluginHistory(): Promise<SpotterHistory> {
    const history = await this.nativeModules
      .storage
      .getItem<SpotterHistory>(this.PLUGIN_HISTORY_STORAGE_KEY);
    return history ?? this.defaultValue;
  }

  async getOptionsHistory(): Promise<SpotterHistory> {
    const history = await this.nativeModules
      .storage
      .getItem<SpotterHistory>(this.OPTIONS_HISTORY_STORAGE_KEY);
    return history ?? this.defaultValue;
  }

  async increaseOptionHistory(option: string, query: string) {
    const currentHistory = await this.getOptionsHistory();
    const nextHistory = this.increase(currentHistory, option, query);
    this.nativeModules.storage.setItem(this.OPTIONS_HISTORY_STORAGE_KEY, nextHistory);
  }

  async increasePluginHistory(option: string, query: string) {
    const currentHistory = await this.getPluginHistory();
    const nextHistory = this.increase(currentHistory, option, query);
    this.nativeModules.storage.setItem(this.PLUGIN_HISTORY_STORAGE_KEY, nextHistory);
  }

  private increase(
    history: SpotterHistory,
    title: string,
    query: string,
  ): SpotterHistory {
    const currentOptionHistory = history[title] ?? { queries: {}, total: 0 };
    return {
      ...history,
      ...({[title]: {
        queries: {
          ...currentOptionHistory.queries,
          [query]: currentOptionHistory.queries[query] ? currentOptionHistory.queries[query] + 1 : 1,
        },
        total: currentOptionHistory.total + 1,
      }})
    };
  }

}
