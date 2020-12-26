import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  LogBox,
} from 'react-native';
import { SpotterOption } from '@spotter-app/core';

// LogBox.ignoreLogs([]);

import Panel from './core/native/panel.native';
import PluginsRegistry from './core/plugins.registry';
import Api from './core/native/api.native';
import Spotify from './plugins/spotify.plugin';
import Applications from './plugins/applications.plugin';
import Calculator from './plugins/calculator.plugin';
import Storage from './core/native/storage.native';
import GlobalHotkey from './core/native/hotkey.native';
import { Search } from './core/components/search.component';
import { Options } from './core/components/options.component';

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

    panel.onEsc(() => {
      panel.close();
      this.setState({
        selectedIndex: 0,
        options: [],
        query: '',
      });
    });

    panel.onUpArrow(() => {
      const { options, selectedIndex } = this.state;
      const nextSelectedIndex = selectedIndex - 1;
      this.setState({ selectedIndex: options[nextSelectedIndex] ? nextSelectedIndex : options.length - 1 })
    });

    panel.onDownArrow(() => {
      const { options, selectedIndex } = this.state;
      const nextSelectedIndex = selectedIndex + 1;
      this.setState({ selectedIndex: options[nextSelectedIndex] ? nextSelectedIndex : 0 })
    });
  }

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
        <Search
          style={styles.input}
          value={query}
          placeholder="Query..."
          onSubmit={() => this.onSubmitEditing()}
          onChange={text => this.onChangeText(text)}
        ></Search>
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
  input: {
    padding: 20,
    fontSize: 18,
    backgroundColor: '#212121',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 0,
  },
  options: {
    backgroundColor: '#212121',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
  },
});
