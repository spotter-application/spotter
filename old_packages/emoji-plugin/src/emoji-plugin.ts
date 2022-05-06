import { Plugin, promisedExec } from '@spotter-app/plugin';
import { OnQueryOption } from '@spotter-app/core';
import { dictionary } from './dictionary';
import packageJSON from '../package.json';

new class EmojiPlugin extends Plugin {

  constructor() {
    super({
      name: packageJSON.name,
      icon: '🚀',
      version: packageJSON.version,
    });
  }

  async onInit() {
    this.spotter.setRegisteredOptions([
      {
        title: 'Emoji',
        prefix: 'emj',
        icon: '🚀',
        onQuery: this.searchEmoji,
      },
    ])
  }

  searchEmoji(q: string): OnQueryOption[] {
    const query = (q.startsWith('e ') ? q.substring(2) : q.substring(1)).replace(' ', '_');

    return Object.entries(dictionary)
      .filter(([, v]) => v.find(s => s.includes(query)))
      .map<OnQueryOption>(([emoji, names]) => ({
        title: `:${names[0]}:`,
        icon: emoji,
        subtitle: `Copy :${names[0]}: to clipboard`,
        onSubmit: async () => await promisedExec(`osascript -e 'set the clipboard to "${emoji}"'`)
          .then(() => true)
          .catch(() => false),
      })).splice(0, 20)
  }
}
