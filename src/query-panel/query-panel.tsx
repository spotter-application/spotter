import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { useApi, useTheme } from '../providers';
import { OptionIcon, Options } from './query-panel-options.component';
import {
  SPOTTER_HOTKEY_IDENTIFIER,
  SpotterPluginOption,
  spotterGlobalHotkeyPress,
} from '../core';
import { InputNative } from '../core/native';
import {
  AppDimensionsPlugin,
  ApplicationsPlugin,
  WebShortcutsPlugin,
  BluetoothPlugin,
  CalculatorPlugin,
  EmojiPlugin,
  BrowserPlugin,
  MusicPlugin,
  PreferencesPlugin,
  SpotifyPlugin,
  TimerPlugin,
  PassPlugin,
  TerminalPlugin,
} from '../plugins';

const plugins = [
  AppDimensionsPlugin,
  ApplicationsPlugin,
  WebShortcutsPlugin,
  BluetoothPlugin,
  CalculatorPlugin,
  EmojiPlugin,
  BrowserPlugin,
  MusicPlugin,
  PreferencesPlugin,
  SpotifyPlugin,
  TimerPlugin,
  PassPlugin,
  TerminalPlugin,
];

const subscriptions: Subscription[] = [];

export const QueryPanel: FC<{}> = () => {

  const { api, registries } = useApi();
  const { colors } = useTheme();
  const [query, setQuery] = useState<string>('');
  const [options, setOptions] = useState<SpotterPluginOption[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);
  const [executingOption, setExecutingOption] = useState<boolean>(false);
  const [activeOption, setActiveOption] = useState<SpotterPluginOption | null>(null)

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    registries.plugins.register(plugins);
    const settings = await registries.settings.getSettings();

    /* Register global hotkeys for spotter and plugins */
    api.globalHotKey.register(settings?.hotkey, SPOTTER_HOTKEY_IDENTIFIER);
    Object.entries(settings.pluginHotkeys).forEach(([plugin, options]) => {
      Object.entries(options).forEach(([option, hotkey]) => {
        api.globalHotKey.register(hotkey, `${plugin}#${option}`);
      });
    });

    api.globalHotKey.onPress(e => spotterGlobalHotkeyPress(e, registries, api));

    subscriptions.forEach(s => s.unsubscribe());

    subscriptions.push(registries.plugins.currentOptions$.subscribe(nextOptions => {
      setExecutingOption(false);
      setSelectedOptionIndex(0);
      setOptions(nextOptions)
    }));

    subscriptions.push(registries.plugins.activeOption$.subscribe(o => setActiveOption(o)));

    subscriptions.push(api.state.value$.pipe(distinctUntilChanged()).subscribe(query => {
      setQuery(query);
      registries.plugins.findOptionsForQuery(query);
    }));
  };

  /* CALLBACKS --------------------------------- */

  const onChangeText = useCallback(async q => {
    if (q === '') {
      resetState();
    }

    if (executingOption) {
      return;
    }

    if (q.endsWith('>')) {
      onTab();
      return;
    }

    api.state.setValue(q);
  }, [executingOption, selectedOptionIndex, options]);

  const onSubmit = useCallback(() => {
    const option: SpotterPluginOption = options[selectedOptionIndex];

    if (!option) {
      return;
    }

    setExecutingOption(true);

    registries.plugins.submitOption(
      option,
      query,
      (success: boolean) => {
        if (success || typeof success !== 'boolean') {
          api.panel.close();
          resetState();
        }

        setExecutingOption(false);
      },
    );
  }, [options, selectedOptionIndex]);

  const onArrowUp = useCallback(() => {
    setSelectedOptionIndex(getPrevOptionIndex(selectedOptionIndex, options));
  }, [selectedOptionIndex, options]);

  const onArrowDown = useCallback(() => {
    setSelectedOptionIndex(getNextOptionIndex(selectedOptionIndex, options));
  }, [selectedOptionIndex, options]);

  const onEscape = useCallback(() => {
    api.panel.close();
    resetState();
  }, []);

  const onCommandComma = useCallback(() => {
    onEscape();
    api.panel.openSettings();
  }, []);

  const onTab = useCallback(() => {
    const option: SpotterPluginOption = options[selectedOptionIndex];

    if (!option || !option.onQuery) {
      return;
    }

    registries.plugins.activateOption(option);
    api.state.setValue('');

    registries.plugins.findOptionsForQuery('');
    setSelectedOptionIndex(0);

  }, [options]);

  const onBackspace = useCallback((prevText: string) => {
    if (prevText.length) {
      return;
    }

    registries.plugins.activateOption(null);

    resetState();
  }, [options]);

  const onSelectAndSubmit = useCallback((index: number) => {
    setSelectedOptionIndex(index);
    onSubmit();
  }, [options, selectedOptionIndex]);

  /* OPTIONS NAVIGATION --------------------------------- */

  const getNextOptionIndex = (currentIndex: number, options: SpotterPluginOption[]): number => {
    return currentIndex + 1 >= options.length
      ? 0
      : currentIndex + 1;
  };

  const getPrevOptionIndex = (currentIndex: number, options: SpotterPluginOption[]): number => {
    return currentIndex - 1 < 0
      ? options.length - 1
      : currentIndex - 1;
  };

  /* ------------------------------------------- */

  const resetState = () => {
    setSelectedOptionIndex(0);
    setOptions([]);
    setExecutingOption(false);
    api.state.setValue('')
    registries.plugins.activateOption(null);
    registries.plugins.findOptionsForQuery('');
  };

  const getHint = useCallback(() => {
    if (!options.length) {
      return '';
    }

    const firstOptionSelected = selectedOptionIndex === 0;

    if (!firstOptionSelected) {
      return '';
    }

    const { title } = options[0];
    const titleContainsQuery = title
      .toLocaleLowerCase()
      .startsWith(query.toLocaleLowerCase());

    if (!titleContainsQuery) {
      return '';
    }

    return title;
  }, [options, selectedOptionIndex])


  return <>
    <SafeAreaView>
      <View style={{
        backgroundColor: colors.background,
        ...styles.input,
        ...(Object.keys(options).length ? styles.inputWithResults : {}),
        display: 'flex',
        flexDirection: 'row',
      }}>
        {
          activeOption ?
            <View style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.active.highlight,
              paddingLeft: 10,
              paddingRight: 10,
              borderRadius: 10,
              marginRight: 5,
            }}>
              <OptionIcon style={{ paddingRight: 3 }} icon={activeOption.icon}></OptionIcon>
              <Text style={{ fontSize: 16 }}>{activeOption.title}</Text>
            </View>
          : null
        }
        <InputNative
          style={{ flex: 1 }}
          value={query}
          placeholder='Query...'
          disabled={executingOption}
          hint={getHint()}
          onChangeText={onChangeText}
          onSubmit={onSubmit}
          onArrowDown={onArrowDown}
          onArrowUp={onArrowUp}
          onEscape={onEscape}
          onCommandComma={onCommandComma}
          onTab={onTab}
          onBackspace={onBackspace}
        ></InputNative>
      </View>
      {Object.keys(options).length ?
        <Options
          style={{ ...styles.options, backgroundColor: colors.background }}
          selectedOption={selectedOptionIndex}
          executingOption={executingOption}
          options={options}
          onSubmit={onSelectAndSubmit}
        ></Options> : null
      }

    </SafeAreaView>
  </>
}

const styles = StyleSheet.create({
  inputWithResults: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  input: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 10,
  },
  options: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    paddingTop: 10,
    paddingBottom: 10,
  },
});
