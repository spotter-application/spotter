import { SpotterPlugin } from "@spotter-app/core";

export class SpotterThemesPlugin extends SpotterPlugin {

  async onInit() {
    this.spotter.registries.options.set([{
      title: 'Spotter themes',
      tabAction: () => ([
        {
          title: 'Dark theme',
          action: () => {
            this.spotter.setTheme('#212121,#ffffff,#3c3c3c,#ffffff,#0f60cf,#fefefe');
            return false;
          },
        },
        {
          title: 'Light theme',
          action: () => {
            this.spotter.setTheme('#efefef,#101010,#dddddd,#000000,#0f60cf,#fefefe');
            return false;
          },
        },
      ]),
    }])
  }
}
