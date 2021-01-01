import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, tap } from 'rxjs/operators';
import { Options } from './core/components/options.component';
import { SpotterOptionWithId } from './core/shared';
import SpotterPluginsInitializations from './core/plugins.initializations';
import { GlobalHotkeyNative, InputNative, PanelNative } from './core/native';
import {
  ApplicationsPlugin,
  AppsDimensionsPlugin,
  CalculatorPlugin,
  GooglePlugin,
  SpotifyPlugin,
  TimerPlugin,
} from './plugins';

type AppState = {
  value: string;
  options: SpotterOptionWithId[];
  selectedIndex: number;
}
export default class App extends React.Component<{}, AppState> {

  private globalHotkey = new GlobalHotkeyNative();
  private panel = new PanelNative();
  private subscriptions: Subscription[] = [];
  private query$ = new Subject<string>();
  private plugins = new SpotterPluginsInitializations([
    ApplicationsPlugin,
    SpotifyPlugin,
    CalculatorPlugin,
    TimerPlugin,
    GooglePlugin,
    AppsDimensionsPlugin,
  ]);

  constructor(props: {}) {
    super(props);

    this.state = {
      value: '',
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
      ).subscribe(),

      this.query$.pipe(
        distinctUntilChanged(),
        tap(query => this.plugins.onQuery(query))
      ).subscribe(),
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
    this.resetValue();
    this.setState({
      selectedIndex: 0,
      options: [],
    });
  };

  onChangeText(query: string) {
    this.query$.next(query);
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
    this.resetValue();
    this.setState({
      selectedIndex: 0,
      options: [],
    });
  };

  componentWillUnmount() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.plugins.destroy();
  }

  resetValue() {
    // TODO: Implement resetValue method for Input
    this.setState({ value: '_' }, () => this.setState({ value: '' }));
  }

  render() {
    const { value, options, selectedIndex } = this.state;
    return <>
      <SafeAreaView>
        <View style={options?.length ? styles.inputWithResults : styles.input}>
          <InputNative
            value={value}
            placeholder="Query..."
            onChangeText={text => this.onChangeText(text)}
            onSubmit={() => this.onSubmitEditing()}
            onArrowDown={() => this.onArrowDown()}
            onArrowUp={() => this.onArrowUp()}
            onEscape={() => this.onEscape()}
          ></InputNative>
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
