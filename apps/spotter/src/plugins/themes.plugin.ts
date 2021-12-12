import { SpotterPlugin } from "@spotter-app/core";

const THEMES = [
  {
    title: 'Dark',
    value: '#212121,#ffffff,#3c3c3c,#ffffff,#0f60cf,#fefefe',
  },
  {
    title: 'Github dimmed',
    value: '#1c2128,#adbac7,#2d333b,#ffffff,#0f60cf,#fefefe',
  },
  {
    title: 'Light',
    value: '#efefef,#101010,#dddddd,#000000,#0f60cf,#fefefe',
  },
];

export class SpotterThemesPlugin extends SpotterPlugin {

  async onInit() {
    this.spotter.setRegisteredOptions([{
      title: 'Spotter themes',
      icon: '🎨',
      prefix: 'thm',
      onQuery: async (q: string) => {
        const settings = await this.spotter.getSettings();
        const themes = THEMES.map(theme => {
          const active = settings.theme === theme.value;
          return {
            title: `${theme.title} ${active ? '- active' : ''}`,
            hovered: active,
            onHover: () => this.spotter.setTheme(theme.value),
            onSubmit: () => this.spotter.patchSettings({theme: theme.value}),
          }
        });

        if (!q.length) {
          return themes;
        }

        const lowercasedQuery = q.toLowerCase();
        return themes.filter(t => t.title.toLowerCase().startsWith(lowercasedQuery));
      },
      onQueryCancel: async () => {
        const settings = await this.spotter.getSettings();
        this.spotter.setTheme(settings.theme);
      },
    }])
  }
}
