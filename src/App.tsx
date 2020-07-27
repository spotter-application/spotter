import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
} from 'react-native';
import Panel from './core/native/panel.native';
import Plugins from './core/plugins.registry';
import Api from './core/native/api.native';

import Spotify from '@spotter-app/spotify-plugin';
import { SpotterPlugin, SpotterApi } from '@spotter-app/core';

export class Applications {

  constructor(private api: SpotterApi) {}

  get actions() {
    return [];
  }

  onSelectAction() {
    console.log('check')
  }

}

export default class App extends React.Component<{}, {}> {

  constructor(
    props: {},
    private panel: Panel,
    private plugins: Plugins,
    private api: Api,
  ) {
    super(props);

    this.panel = new Panel();
    this.plugins = new Plugins();
    this.api = new Api();

    this.plugins.register(
      new Spotify(this.api)
    );

    this.panel.registerHotkey(null); // TODO: do
    // this.panel.registerOptions(this.plugins.getAllActions());

    this.panel.registerQueryCallback(query => {
      const actions = this.plugins.getAllActions();
      this.panel.displayOptions(actions.filter(a => a.title.toUpperCase().includes(query.toUpperCase())))
    });
    // this.panel.registerOnSelectedCallback((actionId) => this.plugins.onSelectAction(actionId));
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
