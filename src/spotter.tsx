import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';

import Panel from './core/native/panel.native';
import Spotify from './plugins/spotify.plugin';
import Applications from './plugins/applications.plugin';
import Calculator from './plugins/calculator.plugin';
import GlobalHotkey from './core/native/globalHotkey.native';
import { Options } from './core/components/options.component';
import { Input } from './core/native/input.native';
import Timer from './plugins/timer.plugin';
import { SpotterOption } from './core/shared';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import SpotterPluginsInitializations from './core/plugins.initializations';

type AppState = {
  query: string;
  options: SpotterOption[];
  selectedIndex: number;
}
export default class App extends React.Component<{}, AppState> {

  private globalHotkey = new GlobalHotkey();
  private panel = new Panel();
  private subscriptions: Subscription[] = [];
  private plugins = new SpotterPluginsInitializations([
    Applications,
    Spotify,
    Calculator,
    Timer,
  ])

  constructor(props: {}) {
    super(props);

    this.state = {
      query: '',
      options: [],
      selectedIndex: 0,
    }
    this.init();
  }

  private init() {
    this.globalHotkey.register('', '');
    this.globalHotkey.onPress(() => this.panel.open());
    this.subscriptions.push(
      this.plugins.options$.pipe(
        tap(options => {
          this.setState({
            selectedIndex: 0,
            options,
          });
        }),
      ).subscribe()
    );
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
    this.panel.close();
    this.setState({
      selectedIndex: 0,
      options: [],
      query: '',
    });
  };

  onChangeText(query: string) {
    this.plugins.onQuery(query);
    this.setState({ query });
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
    this.panel.close();
    this.setState({
      selectedIndex: 0,
      options: [],
      query: '',
    });
  };

  componentWillUnmount() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.plugins.destroy();
  }

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
