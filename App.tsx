import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
} from 'react-native';
import Panel from './core/panel';
import Spotify from './spotify/spotify';
import Plugins from './core/plugins';

export default class App extends React.Component<{}, {}> {

  constructor(
    props: {},
    private panel: Panel,
    private plugins: Plugins,
  ) {
    super(props);

    this.panel = new Panel();
    this.plugins = new Plugins();

    this.plugins.register(new Spotify());

    this.panel.registerHotkey(null); // TODO: do
    this.panel.registerOptions(this.plugins.getAllActions());
    this.panel.registerOnSelectedCallback((actionId) => this.plugins.onSelectAction(actionId));
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
