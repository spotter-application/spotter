import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { SpotterOption } from '@spotter-app/core';

import Panel from './core/native/panel.native';
import PluginsRegistry from './core/plugins.registry';
import Api from './core/native/api.native';
import Spotify from './plugins/spotify.plugin';
import Applications from './plugins/applications.plugin';
import Calculator from './plugins/calculator.plugin';
import Storage from './core/native/storage.native';
import GlobalHotkey from './core/native/hotkey.native';
import { Options } from './core/components/options.component';
import { Input } from './core/native/input.native';

const hotKey = new GlobalHotkey();
const panel = new Panel();
const pluginsRegistry = new PluginsRegistry();
const api = new Api();
const storage = new Storage();

pluginsRegistry.register([
  new Spotify(api),
  new Applications(api, storage),
  new Calculator(),
]);

hotKey.register('', ''); // TODO: do

type AppState = {
  query: string;
  options: SpotterOption[];
  selectedIndex: number;
}

export default class App extends React.Component<{}, AppState> {

  constructor(props: {}) {
    super(props);

    this.state = {
      query: '',
      options: [],
      selectedIndex: 0,
    }

    hotKey.onPress(() => {
      panel.open();
    });
  }

  onArrowUp() {
    const { options, selectedIndex } = this.state;
    const nextSelectedIndex = selectedIndex - 1;
    this.setState({ selectedIndex: options[nextSelectedIndex] ? nextSelectedIndex : options.length - 1 })
  };

  onArrowDown() {
    const { options, selectedIndex } = this.state;
    const nextSelectedIndex = selectedIndex + 1;
    this.setState({ selectedIndex: options[nextSelectedIndex] ? nextSelectedIndex : 0 })
  };

  onEscape() {
    panel.close();
    this.setState({
      selectedIndex: 0,
      options: [],
      query: '',
    });
  };

  onChangeText(query: string) {
    const options = pluginsRegistry.list.reduce<SpotterOption[]>((acc, plugin) => (
      [...acc, ...plugin.query(query)]
    ), []);

    this.setState({
      selectedIndex: 0,
      options,
      query,
    });
  };

  onSubmitEditing() {
    const { options, selectedIndex } = this.state;
    if (!options[selectedIndex]) {
      return;
    }

    this.execAction(options[selectedIndex]);
  };

  execAction(option: any) {
    if (!option?.action) {
      return;
    }

    option.action();
    panel.close();
    this.setState({
      selectedIndex: 0,
      options: [],
      query: '',
    });
  };

  render() {
    const { query, options, selectedIndex } = this.state;
    return <>
      <SafeAreaView>
        <View style={options?.length ? styles.inputWithResults : styles.input}>
          <Input
            value={query}
            placeholder="Query..."
            onChangeText={text => this.onChangeText(text)}
            onSubmit={() => this.onSubmitEditing()}
            onArrowDown={() => this.onArrowDown()}
            onArrowUp={() => this.onArrowUp()}
            onEscape={() => this.onEscape()}
          ></Input>
        </View>
        <Options
          style={styles.options}
          selectedIndex={selectedIndex}
          options={options}
          onSubmit={option => this.execAction(option)}
        ></Options>
      </SafeAreaView>
    </>
  }
}

const styles = StyleSheet.create({
  inputWithResults: {
    backgroundColor: '#212121',
    padding: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
  },
  input: {
    backgroundColor: '#212121',
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  options: {
    backgroundColor: '#212121',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
  },
});
