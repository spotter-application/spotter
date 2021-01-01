import { SpotterOption, SpotterPlugin, SpotterPluginLifecycle } from '../core/shared';

export class Google extends SpotterPlugin implements SpotterPluginLifecycle {

  async onQuery(query: string): Promise<SpotterOption[]> {
    const [prefix, ...googleQueryArray ] = query.split(' ');
    const googleQueryString = googleQueryArray.join(' ');

    const googleQuery = googleQueryString?.length
      ? googleQueryString
      : await this.nativeModules.clipboard.getValue();

    if (prefix.toLowerCase() !== 'g' || !googleQuery.trim()?.length) {
      return [];
    }

    const suggestions = await this.getSuggestions(googleQuery) ?? [];

    return [
      {
        title: `g ${googleQuery}`,
        subtitle: `Search google for ${googleQuery}`,
        action: () => this.openSuggestion(googleQuery),
        image: '',
      },
      ...suggestions.map(suggestion => ({
        title: `g ${suggestion}`,
        subtitle: `Search google for ${suggestion}`,
        action: () => this.openSuggestion(suggestion),
        image: '',
      }))
    ];
  }


  private async getSuggestions(q: string): Promise<string[]> {
    const searchURL = `http://suggestqueries.google.com/complete/search?${new URLSearchParams({ client: 'chrome', q })}`;
    const [_, suggestions] = await fetch(searchURL).then(result => result.json()).catch(() => []);
    return suggestions;
  }

  private openSuggestion(q: string) {
    const uri = `http://www.google.com/search?q=${q}`;
    this.nativeModules.api.shellCommand(`open "${encodeURI(uri)}"`);
  }

}
