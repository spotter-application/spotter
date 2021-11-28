import {
  SpotterOption,
  InternalPlugin,
  InternalPluginLifecycle,
  spotterSearch, SpotterWebsiteShortcut
} from '../../../core';

export class WebShortcutsPlugin extends InternalPlugin implements InternalPluginLifecycle{
  identifier = 'WebShortcuts';
  private WEBSTORAGE : string = "WEBSHORTCUTS";
  private settings : SpotterWebsiteShortcut[] = [];
  private shortcuts : SpotterOption[] = [];

  async onInit() {
    this.settings = await this.api.storage.getItem(this.WEBSTORAGE) ?? [];
  }

  async onOpenSpotter() {
    this.settings = await this.api.storage.getItem(this.WEBSTORAGE) ?? [];
    if(this.settings)
    this.shortcuts = this.settings.map(s=>({
      title: s.url + " - " + s.shortcut,
      subtitle: s.url,
      action: ()=>this.openUrl(s.url),
      icon: {uri: `https://api.faviconkit.com/${s.url}/57`},
    }));
  }

  private addHTTP(url: string): string {
    if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
      url = 'http://' + url;
    }
    return url;
  }

  private openUrl(url: string) {
    this.api.shell.execute(`open "${this.addHTTP(url)}"`);
  }

  onQuery(query: string): SpotterOption[] {
    return spotterSearch(query, this.shortcuts, this.identifier);
  }
}
