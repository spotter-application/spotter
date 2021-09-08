import { InternalPlugin, InternalPluginLifecycle, InternalPluginOption } from "../core";
import icon from '../../preview/icon.png';
import { Settings } from "../providers/settings.provider";

const LIBRARY = [
  'spotter-applications-plugin',
  'spotter-spotify-plugin',
];

export class PluginsPlugin extends InternalPlugin implements InternalPluginLifecycle {

  async onInit(): Promise<InternalPluginOption[]> {

    return [{
      title: 'Plugins',
      icon,
      queryAction: async (query: string) => {

        const settings: Settings = await this.getSettings();

        return [
          {
            title: 'Install ...',
            icon,
            queryAction: (query: string) => ([
              ...LIBRARY
                .filter(plugin => !settings.plugins.find(p => p === plugin))
                .map(plugin => ({
                  title: plugin,
                  action: async () => {
                    try {
                      // TODO: add installing spinner
                      await this.api.shell.execute(`npm i -g ${plugin}`);
                      this.registerPlugin(plugin);
                    } catch {

                    }
                  },
                }))
            ]),
          },
          ...(settings.plugins.map(plugin => ({
            title: plugin,
            icon,
            queryAction: () => ([
              {
                title: 'Uninstall',
                icon,
                action: async () => {
                  await this.api.shell.execute(`npm uninstall -g ${plugin}`);
                  this.unregisterPlugin(plugin);
                  console.log('REMOVE PLUGIN!!');
                }
              }
            ])
          }))),
        ];
      }
    }];
  }
}
