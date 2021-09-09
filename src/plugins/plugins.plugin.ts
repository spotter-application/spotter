import {
  InternalPlugin,
  InternalPluginLifecycle,
  InternalPluginOption,
  INTERNAL_PLUGIN_KEY,
} from '../core';
import icon from '../../preview/icon.png';
import { Settings } from '../providers/settings.provider';
import fetch from 'node-fetch';

const LIBRARY = [
  'spotter-applications-plugin',
  'spotter-spotify-plugin',
];

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
                return [];
              }

              const queryPackages = await fetch(
                `https://www.npmjs.com/search/suggestions?q=${query}`
              ).then(r => r.json());

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
                      this.registerPlugin(p.name);
                    } catch {
                      console.log('INSTALLATION ERROR');
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
              }
            ])
          }))),
        ];
      }
    }];
  }
}