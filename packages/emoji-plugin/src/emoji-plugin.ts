import { Plugin, promisedExec } from '@spotter-app/plugin';
import { OnQueryOption } from '@spotter-app/core';
import { dictionary } from './dictionary';

new class EmojiPlugin extends Plugin {

  constructor() {
    super('emoji-plugin');
  }

  async onInit() {
    const randomIndex = Math.floor(Math.random() * Object.keys(dictionary).length);
    const icon = Object.keys(dictionary)[randomIndex];
    this.spotter.setRegisteredOptions([
      {
        title: 'Emoji',
        prefix: 'emj',
        icon: icon,
        onQuery: (q) => this.searchEmoji(q),
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
