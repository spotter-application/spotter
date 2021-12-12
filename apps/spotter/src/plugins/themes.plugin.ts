import { SpotterPlugin } from "@spotter-app/core";

interface Theme {
  title: string,
  value: string,
  userTheme?: boolean,
}

const THEMES: Theme[] = [
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

const hexRegExp = /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;

export class SpotterThemesPlugin extends SpotterPlugin {

  async onInit() {
    this.spotter.setRegisteredOptions([{
      title: 'Spotter themes',
      icon: '🎨',
      prefix: 'thm',
      onQuery: async (q: string) => {
        const settings = await this.spotter.getSettings();
        const storage = await this.spotter.getStorage<{themes: Theme[]}>();

        const themes = [
          ...THEMES,
          ...(storage.themes ?? []).map(t => ({...t, userTheme: true})),
        ].map(theme => {
          const active = settings.theme === theme.value;
          return {
            title: `${theme.title} ${active ? '- active' : ''}`,
            hovered: active,
            onHover: () => this.spotter.setTheme(theme.value),
            onSubmit: () => this.spotter.patchSettings({theme: theme.value}),
            ...(theme.userTheme ? {onQuery: (q: string) => {
              return [{
                title: 'Remove',
                onSubmit: () => {
                  if (active) {
                    this.spotter.setTheme(THEMES[0].value)
                    this.spotter.patchSettings({theme: THEMES[0].value})
                  }

                  this.spotter.patchStorage({
                    themes: (storage.themes ?? []).filter(t => t.value !== theme.value),
                  });
                }
              }];
            }} : {})
          }
        });

        if (!q.length) {
          return themes;
        }

        if (q.startsWith('#')) {
          const colors = q.split(',');
          const validTheme = colors.length === 6 && colors.every(c => hexRegExp.test(c));

          if (!validTheme) {
            return [{
              title: 'Invalid theme',
            }];
          }
          
          const theme = q;
          this.spotter.setTheme(theme);
          return [{
            title: 'Save theme as',
            onQuery: (q: string) => {
              this.spotter.setPlaceholder('Theme name');
              if (!q.length) {
                return [];
              }
              return [{
                title: 'Save',
                onSubmit: async () => {
                  const storage = await this.spotter.getStorage<{themes: Theme[]}>();
                  this.spotter.patchStorage({
                    themes: [
                      ...(storage.themes ?? []),
                      { title: q, value: theme },
                    ],
                  });
                  this.spotter.patchSettings({ theme });
                  return true;
                }
              }]
            },
          }];
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
