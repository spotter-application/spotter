import { SpotterPlugin } from "@spotter-app/core";

export class SpotterThemesPlugin extends SpotterPlugin {

  async onInit() {
    this.spotter.setRegisteredOptions([{
      title: 'Spotter themes',
      prefix: 'thm',
      onQuery: () => ([
        {
          title: 'Dark theme',
          onHover: () => {
            this.spotter.setTheme('#212121,#ffffff,#3c3c3c,#ffffff,#0f60cf,#fefefe');
            return false;
          },
        },
        {
          title: 'Github dimmed theme (active)',
          hovered: true,
          onHover: () => {
            this.spotter.setTheme('#1c2128,#adbac7,#2d333b,#ffffff,#0f60cf,#fefefe');
            return false;
          },
        },
        {
          title: 'Light theme',
          onHover: () => {
            this.spotter.setTheme('#efefef,#101010,#dddddd,#000000,#0f60cf,#fefefe');
            return false;
          },
        },
      ]),
      onQueryCancel: () => console.log('cancel'),
    }])
  }
}
