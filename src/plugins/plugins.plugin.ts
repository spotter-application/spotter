import {
  InternalPlugin,
  InternalPluginLifecycle,
  InternalPluginOption,
  INTERNAL_PLUGIN_KEY,
  isLocalPluginPath,
} from '../core';
import icon from '../../preview/icon.png';
import { Settings } from '@spotter-app/core';

export class PluginsPlugin extends InternalPlugin implements InternalPluginLifecycle {

  async onInit(): Promise<InternalPluginOption[]> {

    return [{
      title: 'Plugins',
      plugin: INTERNAL_PLUGIN_KEY,
      icon,
      queryAction: async (query: string) => {

        const settings: Settings = await this.getSettings();

        return [
          {
            title: 'Install',
            plugin: INTERNAL_PLUGIN_KEY,
            icon,
            queryAction: async (query: string) => {
              if (!query?.length) {
                // return [];
                query = 'spotter-';
              }

              const localPluginPath = isLocalPluginPath(query);
              if (localPluginPath) {
                return [{
                  title: `Install local plugin: ${query.substring(0, 40)}${query?.length > 40 ? '...' : ''}`,
                  plugin: INTERNAL_PLUGIN_KEY,
                  icon,
                  action: async () => {
                    try {
                      const testCommand = {
                        type: 'onInit',
                        storage: {},
                      }

                      // TODO: add installing spinner
                      await this.api.shell.execute(`node ${query} ${JSON.stringify(testCommand)}`);
                      this.registerPlugin(settings, query);
                    } catch (e) {
                      console.log('INSTALLATION ERROR: ', e);
                    }
                  },
                }];
              }


              if (!query.toLowerCase().startsWith('spotter')) {
                query = `spotter-${query}`;
              }

              const queryPackages = await fetch(
                `https://www.npmjs.com/search/suggestions?q=${query}`
              )
                .then(r => r.json())
                .then(r => r.filter((p: any) =>
                  p.name !== 'spotter' &&
                  p.name.toLowerCase().startsWith('spotter') &&
                  !settings.plugins.find(name => p.name === name))
                );

              if (queryPackages) {
                return queryPackages.map((p: any) => ({
                  title: p.name,
                  plugin: INTERNAL_PLUGIN_KEY,
                  action: async () => {
                    try {
                      const testCommand = {
                        type: 'onInit',
                        storage: {},
                      }
                      // TODO: add installing spinner
                      await this.api.shell.execute(`npx ${p.name} ${JSON.stringify(testCommand)}`);

                      await this.api.shell.execute(`npm i -g ${p.name}`);
                      this.registerPlugin(settings, p.name);
                    } catch (e) {
                      console.log('INSTALLATION ERROR: ', e);
                    }
                  }
                }));
              }
            }
            // queryAction: (query: string) => ([
            //   ...LIBRARY
            //     .filter(plugin => !settings.plugins.find(p => p === plugin))
            //     .map(plugin => ({
            //       title: plugin,
            //       action: async () => {
            //         try {
            //           // TODO: add installing spinner
            //           await this.api.shell.execute(`npm i -g ${plugin}`);
            //           this.registerPlugin(plugin);
            //         } catch {

            //         }
            //       },
            //     }))
            // ]),
          },
          ...(settings.plugins.map(plugin => ({
            title: plugin,
            plugin: INTERNAL_PLUGIN_KEY,
            icon,
            queryAction: () => ([
              {
                title: 'Uninstall',
                plugin: INTERNAL_PLUGIN_KEY,
                icon,
                action: async () => {
                  await this.api.shell.execute(`npm uninstall -g ${plugin}`);
                  this.unregisterPlugin(plugin);
                  console.log('REMOVE PLUGIN!!');
                }
              },
              {
                title: 'Reinstall',
                plugin: INTERNAL_PLUGIN_KEY,
                icon,
                action: async () => {
                  // this.unregisterPlugin(plugin);
                  await this.registerPlugin(settings, plugin);
                }
              }
            ])
          }))),
        ];
      }
    }];
  }
}
