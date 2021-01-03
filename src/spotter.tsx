import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, tap } from 'rxjs/operators';
import { Options } from './core/components/options.component';
import { SpotterNativeModules, SpotterOptionWithId } from './core/shared';
import SpotterPluginsInitializations from './core/plugins.initializations';
import { InputNative } from './core/native';
import {
  ApplicationsPlugin,
  AppsDimensionsPlugin,
  CalculatorPlugin,
  GooglePlugin,
  SpotifyPlugin,
  TimerPlugin,
} from './plugins';
import { SettingsRegistry } from './core/settings.registry';

type Props = {
  nativeModules: SpotterNativeModules
}

type State = {
  value: string;
  options: SpotterOptionWithId[];
  selectedIndex: number;
}
export default class App extends React.Component<Props, State> {
  private settingsRegistry = new SettingsRegistry();
  private subscriptions: Subscription[] = [];
  private query$ = new Subject<string>();
  private plugins = new SpotterPluginsInitializations([
    ApplicationsPlugin,
    SpotifyPlugin,
    CalculatorPlugin,
    TimerPlugin,
    GooglePlugin,
    AppsDimensionsPlugin,
  ], this.props.nativeModules);

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
    const settings = await this.settingsRegistry.getSettings();
    this.props.nativeModules.globalHotKey.register(settings?.hotkey);
    this.props.nativeModules.globalHotKey.onPress(() => this.props.nativeModules.panel.open());

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
    this.query$.next(query);
  };

  onSubmitEditing() {
    const { options, selectedIndex } = this.state;
    if (!options[selectedIndex]) {
      return;
    };

    this.execAction(options[selectedIndex]);
  };

  execAction(option: any) {
    if (!option?.action) {
      return;
    };

    option.action();
    this.props.nativeModules.panel.close();
    this.resetValue();
    this.setState({
      selectedIndex: 0,
      options: [],
    });
  };

  componentWillUnmount() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.plugins.destroy();
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
