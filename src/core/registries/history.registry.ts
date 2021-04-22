import { SpotterHistory, SpotterHistoryRegistry, SpotterApi } from '..';

export class HistoryRegistry implements SpotterHistoryRegistry {
  private nativeModules: SpotterApi;
  private OPTIONS_HISTORY_STORAGE_KEY = 'OPTIONS_HISTYRY_STORAGE_KEY_v1';
  private defaultValue: SpotterHistory = {};

  constructor(nativeModules: SpotterApi) {
    this.nativeModules = nativeModules;
  }

  async getOptionsHistory(): Promise<SpotterHistory> {
    const history = await this.nativeModules
      .storage
      .getItem<SpotterHistory>(this.OPTIONS_HISTORY_STORAGE_KEY);
    return history ?? this.defaultValue;
  }

  async increaseOptionHistory(path: string[], query: string) {
    const currentHistory = await this.getOptionsHistory();
    const nextHistory = this.increase(currentHistory, path, query);
    this.nativeModules.storage.setItem(this.OPTIONS_HISTORY_STORAGE_KEY, nextHistory);
  }

  private increase(
    history: SpotterHistory,
    path: string[],
    query: string,
  ): SpotterHistory {
    if (!path.length) {
      return history;
    }
    const stringPath = path.join('#');
    const currentOptionHistory = history[stringPath] ?? { queries: {}, total: 0 };
    return {
      ...history,
      ...({[stringPath]: {
        queries: {
          ...currentOptionHistory.queries,
          [query]: currentOptionHistory.queries[query] ? currentOptionHistory.queries[query] + 1 : 1,
        },
        total: currentOptionHistory.total + 1,
      }})
    };
  }

}
