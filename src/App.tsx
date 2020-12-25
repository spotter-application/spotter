import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { SpotterOption } from '@spotter-app/core';

import Panel from './core/native/panel.native';
import PluginsRegistry from './core/plugins.registry';
import Api from './core/native/api.native';
import Spotify from './plugins/spotify.plugin';
import OptionsRegistry from './core/options.registry';
import Applications from './plugins/applications.plugin';
import Calculator from './plugins/calculator.plugin';
import Storage from './core/native/storage.native';

export default class App extends React.Component<{}, {}> {

  constructor(
    props: {},
    private panel: Panel,
    private pluginsRegistry: PluginsRegistry,
    private optionsRegistry: OptionsRegistry,
    private api: Api,
    private storage: Storage,
  ) {
    super(props);

    this.panel = new Panel();
    this.pluginsRegistry = new PluginsRegistry();
    this.optionsRegistry = new OptionsRegistry();
    this.api = new Api();
    this.storage = new Storage();

    this.pluginsRegistry.register([
      new Spotify(this.api),
      new Applications(this.api, this.storage),
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
        <SafeAreaView style={styles.container}>
          <TextInput placeholder="Query..." style={styles.input} caretHidden={true} autoCorrect={false} autoFocus={true}></TextInput>
          {/* <ScrollView contentInsetAdjustmentBehavior="automatic"> */}
            <Text>Results</Text>
          {/* </ScrollView> */}
        </SafeAreaView>
      </>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    // paddingTop: 15,
  },
  input: {
    padding: 15,
    fontSize: 18,
    backgroundColor: '#000',
    elevation: 0,
    borderRadius: 10,
    borderWidth: 5,
    borderColor: '#000',
  },
});