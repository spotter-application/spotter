import { SpotterPlugin, SpotterPluginLifecycle } from '../core/shared';

export class Google extends SpotterPlugin implements SpotterPluginLifecycle {

  async onQuery(query: string) {
    const [prefix, ...googleQueryArray ] = query.split(' ');
    const googleQuery = googleQueryArray.join(' ');

    if (prefix.toLowerCase() !== 'g' || !googleQuery) {
      return;
    }

    const suggestions = await this.getSuggestions(googleQuery);

    if (!suggestions?.length) {
      return;
    }

    this.setOptions([
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
    ]);
  }


  private async getSuggestions(q: string): Promise<string[]> {
    const searchURL = `http://suggestqueries.google.com/complete/search?${new URLSearchParams({ client: 'chrome', q })}`;
    const [_, suggestions] = await fetch(searchURL).then(result => result.json()).catch(() => []);
    return suggestions;
  }

  private openSuggestion(q: string) {
    this.nativeModules.api.shellCommand(`open http://www.google.com/search?${new URLSearchParams({ q })}`)
  }

}
