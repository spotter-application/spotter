import { SpotterOption, InternalPlugin, InternalPluginLifecycle, spotterSearch } from '../../../core';

const HISTORY_URLS_STORAGE_KEY = 'HISTORY_URLS_STORAGE_KEY';

export class BrowserPlugin extends InternalPlugin implements InternalPluginLifecycle {

  identifier = 'Browser';

  private historyUrls: string[] = [];

  async onOpenSpotter() {
    const historyUrls = await this.api.storage.getItem<string[]>(HISTORY_URLS_STORAGE_KEY);
    this.historyUrls = historyUrls ?? [];
  }

  async onQuery(query: string): Promise<SpotterOption[]> {

    const options = this.historyUrls.map(url => ({
      title: url,
      subtitle: `Open ${url}`,
      action: () => this.openUrl(url),
      icon: {uri: `https://api.faviconkit.com/${url}/57`},
      onQuery: (q: string) => {
        return [{
          title: `Translate ${q}`,
          action: () => this.openUrl(`https://www.deepl.com/translator#en/ru/${encodeURI(q)}`),
        }];
      }
    }));

    if (!this.validateUrl(query) || this.historyUrls.find(u => u === query)) {
      return spotterSearch(query, options, this.identifier);
    }

    return spotterSearch(
      query,
      [
        ...options,
        {
          title: query,
          subtitle: 'Open',
          action: () => {
            this.addUrlToHistory(query);
            this.openUrl(query);
          },
          icon: {uri: `https://api.faviconkit.com/${query}/57`},
        }
      ],
      this.identifier,
    )
  }

  private async addUrlToHistory(url: string) {
    const currentHistoryUrls = await this.api.storage.getItem<string[]>(HISTORY_URLS_STORAGE_KEY) ?? [];
    if (currentHistoryUrls.find(u => u === url)) {
      return;
    }

    await this.api.storage.setItem(
      HISTORY_URLS_STORAGE_KEY,
      [...currentHistoryUrls, url],
    );
  }

  private openUrl(url: string) {
    this.api.shell.execute(`open "${this.addHTTP(url)}"`);
  }

  private validateUrl(str: string): boolean {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }

  private addHTTP(url: string): string {
    if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
      url = 'http://' + url;
    }
    return url;
  }


  // private async getSuggestions(q: string): Promise<string[]> {
  //   const searchURL = `http://suggestqueries.google.com/complete/search?${new URLSearchParams({ client: 'chrome', q })}`;
  //   const [_, suggestions] = await fetch(searchURL).then(result => result.json()).catch(() => []);
  //   return suggestions;
  // }

  // private async openSuggestion(q: string) {
  //   const uri = `http://www.google.com/search?q=${q}`;
  //   await this.nativeModules.shell.execute(`open "${encodeURI(uri)}"`);
  // }

}
