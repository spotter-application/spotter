import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
} from 'react-native';
import { SpotterOption } from '@spotter-app/core';

import Panel from './core/native/panel.native';
import PluginsRegistry from './core/plugins.registry';
import Api from './core/native/api.native';
import Spotify from './plugins/spotify.plugin';
import OptionsRegistry from './core/options.registry';
import Applications from './plugins/applications.plugin';
import Calculator from './plugins/calculator.plugin';

export default class App extends React.Component<{}, {}> {

  constructor(
    props: {},
    private panel: Panel,
    private pluginsRegistry: PluginsRegistry,
    private optionsRegistry: OptionsRegistry,
    private api: Api,
  ) {
    super(props);

    this.panel = new Panel();
    this.pluginsRegistry = new PluginsRegistry();
    this.optionsRegistry = new OptionsRegistry();
    this.api = new Api();

    this.pluginsRegistry.register([
      new Spotify(this.api),
      new Applications(this.api),
      new Calculator(),
    ]);

    this.panel.registerHotkey(null); // TODO: do

    this.panel.registerQueryCallback(query => {
      const possibleOptions = this.pluginsRegistry.list.reduce<SpotterOption[]>((acc, plugin) => (
        [...acc, ...plugin.query(query)]
      ), []);

      this.optionsRegistry.clear();
      const registeredOptions = this.optionsRegistry.register(possibleOptions);

      this.panel.displayOptions(registeredOptions)
    });

    this.panel.registerOnSelectedCallback((id) => this.optionsRegistry.getById(id)?.action());
  }

  render() {
    return (
      <>
        <SafeAreaView>
          <ScrollView contentInsetAdjustmentBehavior="automatic">
            <Text>Settings</Text>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
};
