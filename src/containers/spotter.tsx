import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Options } from '../components/options.component';
import { SpotterNativeModules, SpotterOption, SpotterOptionWithId, SpotterRegistries } from '../core';
import { InputNative } from '../native';
import {
  ApplicationsPlugin,
  AppsDimensionsPlugin,
  BluetoothPlugin,
  CalculatorPlugin,
  GooglePlugin,
  SpotifyPlugin,
  TimerPlugin,
} from '../plugins';

const plugins = [
  ApplicationsPlugin,
  SpotifyPlugin,
  CalculatorPlugin,
  TimerPlugin,
  GooglePlugin,
  AppsDimensionsPlugin,
  BluetoothPlugin,
];

type Props = {
  nativeModules: SpotterNativeModules,
  registries: SpotterRegistries,
}

type State = {
  value: string;
  options: SpotterOptionWithId[];
  selectedIndex: number;
}
export default class App extends React.Component<Props, State> {
  private subscriptions: Subscription[] = [];

  constructor(props: Props) {
    super(props);

    this.state = {
      value: '',
      options: [],
      selectedIndex: 0,
    }
    this.init();
  }

  private async init() {
    this.props.registries.plugins.register(plugins);
    const settings = await this.props.registries.settings.getSettings();
    this.props.nativeModules.globalHotKey.register(settings?.hotkey);
    this.props.nativeModules.globalHotKey.onPress(() => this.props.nativeModules.panel.open());

    this.subscriptions.push(
      this.props.registries.plugins.options$.pipe(
        tap(async options => {
          const history = await this.props.registries.history.getHistory();
          const sortedOptionsByFrequently = options.sort((a, b) =>
            (history[b.title] ?? 0) - (history[a.title] ?? 0)
          );

          this.setState({
            selectedIndex: 0,
            options: sortedOptionsByFrequently,
          });
        }),
      ).subscribe(),
    );
  };

  onArrowUp() {
    const { options, selectedIndex } = this.state;
    const nextSelectedIndex = selectedIndex - 1;
    this.setState({ selectedIndex: options[nextSelectedIndex] ? nextSelectedIndex : options.length - 1 });
  };

  onArrowDown() {
    const { options, selectedIndex } = this.state;
    const nextSelectedIndex = selectedIndex + 1;
    this.setState({ selectedIndex: options[nextSelectedIndex] ? nextSelectedIndex : 0 })
  };

  onEscape() {
    this.props.nativeModules.panel.close();
    this.resetValue();
    this.setState({
      selectedIndex: 0,
      options: [],
    });
  };

  onChangeText(query: string) {
    this.props.registries.plugins.findOptionsForQuery(query)
  };

  onSubmitEditing() {
    const { options, selectedIndex } = this.state;
    if (!options[selectedIndex]) {
      return;
    };

    this.execAction(options[selectedIndex]);
  };

  execAction(option: SpotterOption) {
    if (!option?.action) {
      return;
    };

    option.action();
    this.props.nativeModules.panel.close();
    this.props.registries.history.increaseHistoryItem(option.title);
    this.resetValue();
    this.setState({
      selectedIndex: 0,
      options: [],
    });
  };

  componentWillUnmount() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.props.registries.plugins.destroy();
  };

  resetValue() {
    // TODO: Implement resetValue method for Input
    this.setState({ value: '_' }, () => this.setState({ value: '' }));
  };

  onCommandComma() {
    this.onEscape();
    this.props.nativeModules.panel.openSettings();
  };

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
            onCommandComma={() => this.onCommandComma()}
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
  };
};

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
