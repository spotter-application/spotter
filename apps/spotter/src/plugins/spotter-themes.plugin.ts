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
      prefix: 'thm',
      onQuery: async () => {
        const settings = await this.spotter.getSettings();
        return THEMES.map(theme => ({
          title: `${theme.title} ${settings.theme === theme.value ? '- active' : ''}`,
          onHover: () => this.spotter.setTheme(theme.value),
          onSubmit: () => this.spotter.patchSettings({theme: theme.value}),
        }));
      },
      onQueryCancel: async () => {
        const settings = await this.spotter.getSettings();
        this.spotter.setTheme(settings.theme);
      },
    }])
  }
}
