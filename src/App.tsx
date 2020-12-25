import React from 'react';
import {
  NativeSyntheticEvent,
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
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
import GlobalHotkey from './core/native/hotkey.native';

export default class App extends React.Component<{}, { options: any[], selectedIndex: number }> {

  constructor(
    props: {},
    private hotKey: GlobalHotkey,
    private panel: Panel,
    private pluginsRegistry: PluginsRegistry,
    private optionsRegistry: OptionsRegistry,
    private api: Api,
    private storage: Storage,
  ) {
    super(props);

    this.hotKey = new GlobalHotkey();
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

    this.hotKey.register('', ''); // TODO: do

    this.hotKey.onPress((e) => this.panel.toggle());

    this.hotKey.onEsc((e) => this.panel.toggle());


    this.hotKey.onUpArrow(() => {
      const { options, selectedIndex } = this.state;
      const nextSelectedIndex = selectedIndex - 1;
      if (!options[nextSelectedIndex]) {
        return;
      }

      this.setState({ selectedIndex: nextSelectedIndex });
    });
    this.hotKey.onDownArrow(() => {
      const { options, selectedIndex } = this.state;
      const nextSelectedIndex = selectedIndex + 1;
      if (!options[nextSelectedIndex]) {
        return;
      }

      this.setState({ selectedIndex: nextSelectedIndex });
    });

    // this.panel.registerQueryCallback(query => {
    //   const possibleOptions = this.pluginsRegistry.list.reduce<SpotterOption[]>((acc, plugin) => (
    //     [...acc, ...plugin.query(query)]
    //   ), []);

    //   this.optionsRegistry.clear();
    //   const registeredOptions = this.optionsRegistry.register(possibleOptions);

    //   this.panel.displayOptions(registeredOptions)
    // });

    // this.panel.registerOnSelectedCallback((id) => this.optionsRegistry.getById(id)?.action());

    this.state = {
      options: [],
      selectedIndex: 0,
    }
  }

  onChangeText(query: string) {
    const possibleOptions = this.pluginsRegistry.list.reduce<SpotterOption[]>((acc, plugin) => (
      [...acc, ...plugin.query(query)]
    ), []);

    this.setState({ options: possibleOptions })

    console.log(possibleOptions);
  }

  onSubmitEditing() {
    const { options, selectedIndex } = this.state;

    if (!options[selectedIndex]) {
      return;
    }

    this.onSubmit(options[selectedIndex]);
  }

  onSubmit(option: any) {
    if (!option?.action) {
      return;
    }

    option.action();
    this.panel.toggle();
  }

  render() {
    const { options, selectedIndex } = this.state;

    return (
      <>
        <SafeAreaView style={styles.container}>
          <TextInput placeholder="Query..." style={styles.input} onSubmitEditing={() => this.onSubmitEditing()} onChangeText={e => this.onChangeText(e)} autoCorrect={false} autoFocus={true}></TextInput>
          <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.options}>
            {options.map((option: any, index) => (
              <View key={option.title} style={selectedIndex === index ? styles.activeOption : styles.option} onTouchEnd={() => this.onSubmit(option)}>
                <Text>{option.title}</Text>
              </View>
            )) }
          </ScrollView>
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
  options: {
    backgroundColor: '#000',
  },
  activeOption: {
    backgroundColor: 'grey',
    padding: 10,
  },
  option: {
    padding: 10,
  }
});