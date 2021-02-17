import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { useApi, useTheme } from '../components';
import { Options } from '../components/options.component';
import { SpotterOption, SPOTTER_HOTKEY_IDENTIFIER } from '../core';
import { spotterConvertLayout } from '../core/convert-layout/convert-layout';
import { InputNative } from '../native';
import {
  AppDimensionsPlugin,
  ApplicationsPlugin,
  BluetoothPlugin,
  CalculatorPlugin,
  EmojiPlugin,
  FinderPlugin,
  GooglePlugin,
  KillAppsPlugin,
  MusicPlugin,
  PreferencesPlugin,
  SpotifyPlugin,
  TimerPlugin,
} from '../plugins';

const plugins = [
  AppDimensionsPlugin,
  ApplicationsPlugin,
  BluetoothPlugin,
  CalculatorPlugin,
  EmojiPlugin,
  FinderPlugin,
  GooglePlugin,
  KillAppsPlugin,
  MusicPlugin,
  PreferencesPlugin,
  SpotifyPlugin,
  TimerPlugin,
];

export const App: FC<{}> = () => {

  const { nativeModules, registries } = useApi();
  const [query, setQuery] = useState<string>('');
  const [options, setOptions] = useState<SpotterOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [executing, setExecuting] = useState<boolean>(false);
  const { colors } = useTheme();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    registries.plugins.register(plugins);
    const settings = await registries.settings.getSettings();

    /* Register global hotkeys for spotter and plugins */
    nativeModules.globalHotKey.register(settings?.hotkey, SPOTTER_HOTKEY_IDENTIFIER);
    Object.entries(settings.pluginHotkeys).forEach(([plugin, options]) => {
      Object.entries(options).forEach(([option, hotkey]) => {
        nativeModules.globalHotKey.register(hotkey, `${plugin}#${option}`);
      });
    });
    nativeModules.globalHotKey.onPress(async (e) => {
      if (e.identifier === SPOTTER_HOTKEY_IDENTIFIER) {
        registries.plugins.onOpenSpotter();
        nativeModules.panel.open();
        return;
      }

      const [plugin, option] = e.identifier.split('#');
      const options = registries.plugins.options[plugin];
      if (options?.length) {
        await options.find(o => o.title === option)?.action();
      }
    });
  };

  const onChangeText = useCallback(async q => {
    if (executing) {
      return;
    }

    const convertedLayoutQuery = spotterConvertLayout(q);
    setQuery(convertedLayoutQuery);

    const history = await registries.history.getHistory();

    registries.plugins.findOptionsForQuery(convertedLayoutQuery, (forQuery, options) => {
      if (q !== forQuery) {
        setSelectedIndex(0);
        setOptions([]);
        return;
      }

      const sortedOptionsByFrequently = options
        .sort((a, b) =>
          (b.title.split(' ').find(t => t.toLocaleLowerCase().startsWith(convertedLayoutQuery.toLocaleLowerCase())) ? 1 : 0) -
          (a.title.split(' ').find(t => t.toLocaleLowerCase().startsWith(convertedLayoutQuery.toLocaleLowerCase())) ? 1 : 0)
        )
        .sort((a, b) => (history[`${b.plugin}#${b.title}`] ?? 0) - (history[`${a.plugin}#${a.title}`] ?? 0));

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

    registries.history.increaseHistoryItem(`${option.plugin}#${option.title}`);
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
      <View style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        ...styles.input,
        ...(options?.length ? styles.inputWithResults : {}),
      }}>
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
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 1,
  },
  input: {
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

