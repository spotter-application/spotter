import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { Options } from '../components/options.component';
import { SpotterNativeModules, SpotterOption, SpotterRegistries } from '../core';
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
  AppsDimensionsPlugin,
  BluetoothPlugin,
  CalculatorPlugin,
  GooglePlugin,
  SpotifyPlugin,
  TimerPlugin,
];

type Props = {
  nativeModules: SpotterNativeModules,
  registries: SpotterRegistries,
}

type State = {
  value: string;
  options: SpotterOption[];
  selectedIndex: number;
  executing: boolean,
}
export default class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      value: '',
      options: [],
      selectedIndex: 0,
      executing: false,
    }
    this.init();
  }

  private async init() {
    this.props.registries.plugins.register(plugins);
    const settings = await this.props.registries.settings.getSettings();
    this.props.nativeModules.globalHotKey.register(settings?.hotkey);
    this.props.nativeModules.globalHotKey.onPress(() => this.props.nativeModules.panel.open());
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

  async onChangeText(query: string) {
    if (this.state.executing) {
      return;
    }

    const history = await this.props.registries.history.getHistory();

    this.props.registries.plugins.findOptionsForQuery(query, (options) => {
      const sortedOptionsByFrequently = options.sort((a, b) =>
        (history[b.title] ?? 0) - (history[a.title] ?? 0)
      );

      this.setState({
        selectedIndex: 0,
        options: sortedOptionsByFrequently,
      });
    });
  };

  onSubmitEditing() {
    const { options, selectedIndex } = this.state;
    if (!options[selectedIndex]) {
      return;
    };

    this.execAction(options[selectedIndex]);
  };

  async execAction(option: SpotterOption) {
    if (!option?.action) {
      return;
    };

    this.props.registries.history.increaseHistoryItem(option.title);

    this.setState({ executing: true });

    const success = await option.action();

    if (success || typeof success !== 'boolean') {
      this.closeSpotter();
    }

    this.setState({ executing: false });
  };

  private closeSpotter() {
    this.props.nativeModules.panel.close();
    this.resetValue();
    this.setState({
      selectedIndex: 0,
      options: [],
      executing: false,
    });
  }

  componentWillUnmount() {
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
    const { value, options, selectedIndex, executing } = this.state;
    return <>
      <SafeAreaView>
        <View style={options?.length ? styles.inputWithResults : styles.input}>
          <InputNative
            value={value}
            placeholder="Query..."
            disabled={executing}
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
          executing={executing}
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
