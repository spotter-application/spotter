import React, { FC, useCallback, useEffect, useState } from 'react';
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

export const App: FC<Props> = ({ nativeModules, registries }) => {

  const [query, setQuery] = useState<string>('');
  const [options, setOptions] = useState<SpotterOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [executing, setExecuting] = useState<boolean>(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    registries.plugins.register(plugins);
    const settings = await registries.settings.getSettings();
    nativeModules.globalHotKey.register(settings?.hotkey);
    nativeModules.globalHotKey.onPress(() => nativeModules.panel.open());
  };

  const onChangeText = useCallback(async query => {
    if (executing) {
      return;
    }

    const history = await registries.history.getHistory();

    registries.plugins.findOptionsForQuery(query, (options) => {
      const sortedOptionsByFrequently = options.sort((a, b) =>
        (history[b.title] ?? 0) - (history[a.title] ?? 0)
      );

      setSelectedIndex(0);
      setOptions(sortedOptionsByFrequently);
    });
  }, [executing]);

  const onSubmitEditing = useCallback(() => {
    if (!options[selectedIndex]) {
      return;
    };

    execAction(options[selectedIndex]);
  }, [options, selectedIndex]);

  const execAction = async (option: SpotterOption) => {
    if (!option?.action) {
      return;
    };

    registries.history.increaseHistoryItem(option.title);
    setExecuting(true);

    const success = await option.action();

    if (success || typeof success !== 'boolean') {
      nativeModules.panel.close();
      resetQuery();
    }

    setExecuting(false);
  };

  const onArrowUp = useCallback(() => {
    const nextSelectedIndex = selectedIndex - 1;
    setSelectedIndex(options[nextSelectedIndex] ? nextSelectedIndex : options.length - 1);
  }, [selectedIndex, options]);

  const onArrowDown = useCallback(() => {
    const nextSelectedIndex = selectedIndex + 1;
    setSelectedIndex(options[nextSelectedIndex] ? nextSelectedIndex : 0);
  }, [selectedIndex, options]);

  const onEscape = useCallback(() => {
    nativeModules.panel.close();
    resetQuery();
  }, []);

  const onCommandComma = useCallback(() => {
    onEscape();
    nativeModules.panel.openSettings();
  }, []);

  const resetQuery = () => {
    setQuery('_');
    // TODO: Implement resetValue method for Input
    setTimeout(() => setQuery(''));
    setSelectedIndex(0);
    setOptions([]);
    setExecuting(false);
  };

  return <>
    <SafeAreaView>
      <View style={options?.length ? styles.inputWithResults : styles.input}>
        <InputNative
          value={query}
          placeholder="Query..."
          disabled={executing}
          onChangeText={onChangeText}
          onSubmit={onSubmitEditing}
          onArrowDown={onArrowDown}
          onArrowUp={onArrowUp}
          onEscape={onEscape}
          onCommandComma={onCommandComma}
        ></InputNative>
      </View>
      <Options
        style={styles.options}
        selectedIndex={selectedIndex}
        executing={executing}
        options={options}
        onSubmit={execAction}
      ></Options>
    </SafeAreaView>
  </>
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
