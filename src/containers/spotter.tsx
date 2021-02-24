import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import {Subscription} from 'rxjs';
import { useApi, useTheme } from '../components';
import { Options } from '../components/options.component';
import { SpotterOptionWithPluginIdentifierMap, SpotterOption, SPOTTER_HOTKEY_IDENTIFIER } from '../core';
import { spotterConvertLayout } from '../core/convert-layout/convert-layout';
import { InputNative } from '../native';
import {
  AppDimensionsPlugin,
  ApplicationsPlugin,
  BluetoothPlugin,
  CalculatorPlugin,
  EmojiPlugin,
  BrowserPlugin,
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
  BrowserPlugin,
  KillAppsPlugin,
  MusicPlugin,
  PreferencesPlugin,
  SpotifyPlugin,
  TimerPlugin,
];

const subscriptions: Subscription[] = [];

interface NextPluginOption {
  option: number;
  plugin: number;
};

export const App: FC<{}> = () => {

  const { nativeModules, registries } = useApi();
  const { colors } = useTheme();
  const [query, setQuery] = useState<string>('');
  const [optionsMap, setOptionsMap] = useState<SpotterOptionWithPluginIdentifierMap>({});
  const [selectedPluginIndex, setSelectedPluginIndex] = useState<number>(0);
  const [expandedPlugins, setExpandedPlugins] = useState<number[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);
  const [executingOption, setExecutingOption] = useState<boolean>(false);
  const [displayOptionsLimit] = useState<number>(3);

  useEffect(() => {
    init();
  }, [selectedPluginIndex, selectedOptionIndex]);

  const init = async () => {
    console.log('INIT');
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
      };
    });


    subscriptions.forEach(s => s.unsubscribe());

    subscriptions.push(registries.plugins.currentOptionsMap$.subscribe(nextOptionsMap => {
      // console.log(nextOptionsMap);
      const nextOptionsValues = Object.values(nextOptionsMap);
      const selectedPluginNextOptions = nextOptionsValues[selectedPluginIndex];

      setExecutingOption(false);

      if (!selectedPluginNextOptions || !selectedPluginNextOptions[selectedOptionIndex]) {
        setSelectedOptionIndex(0);
      }

      if (selectedPluginIndex >= nextOptionsValues.length) {
        setSelectedPluginIndex(0);
      }

      setOptionsMap(nextOptionsMap)
    }));

  };

  /* CALLBACKS --------------------------------- */

  const onChangeText = useCallback(async q => {
    if (q === '') {
      resetQuery();
    }

    if (executingOption) {
      return;
    }

    const convertedLayoutQuery = spotterConvertLayout(q);

    registries.plugins.findOptionsForQuery(convertedLayoutQuery);

    // registries.plugins.findOptionsForQuery(convertedLayoutQuery, (forQuery, nextOptions) => {
    //   const nextOptionsValues = Object.values(nextOptions);
    //   const selectedPluginNextOptions = nextOptionsValues[selectedPluginIndex];

    //   if (!selectedPluginNextOptions || !selectedPluginNextOptions[selectedOptionIndex]) {
    //     setSelectedOptionIndex(0);
    //   }

    //   if (selectedPluginIndex >= nextOptionsValues.length) {
    //     setSelectedPluginIndex(0);
    //   }

    //   setOptions(nextOptions)
    // });
  }, [executingOption, selectedPluginIndex, selectedOptionIndex]);

  const onSubmit = useCallback(() => {
    const selectedPluginExpanded = expandedPlugins.filter(p => p === selectedPluginIndex).length;
    const selectedExpandAction = !selectedPluginExpanded && selectedOptionIndex >= displayOptionsLimit;

    if (selectedExpandAction) {
      setExpandedPlugins([...expandedPlugins ,selectedPluginIndex]);
      return;
    }

    const pluginOptions = Object.values(optionsMap)[selectedPluginIndex];

    if (!pluginOptions) {
      return;
    }

    const selectedOption: SpotterOption = pluginOptions[selectedOptionIndex];

    if (!selectedOption) {
      return;
    }

    setExecutingOption(true);

    const pluginIdentifier: string = Object.keys(optionsMap)[selectedPluginIndex];
    registries.plugins.selectOption({...selectedOption, pluginIdentifier }, (success: boolean) => {
      if (success || typeof success !== 'boolean') {
        nativeModules.panel.close();
        resetQuery();
      }

      setExecutingOption(false);
    });
  }, [optionsMap, selectedOptionIndex, selectedPluginIndex, expandedPlugins]);

  const onArrowUp = useCallback(() => {
    const { option, plugin } = getPrevOption(selectedOptionIndex, selectedPluginIndex, expandedPlugins, optionsMap, displayOptionsLimit);
    setSelectedOptionIndex(option);
    setSelectedPluginIndex(plugin);
  }, [selectedOptionIndex, selectedPluginIndex, expandedPlugins, optionsMap, displayOptionsLimit]);

  const onArrowDown = useCallback(() => {
    const { option, plugin } = getNextOption(selectedOptionIndex, selectedPluginIndex, expandedPlugins, optionsMap, displayOptionsLimit);
    setSelectedOptionIndex(option);
    setSelectedPluginIndex(plugin);
  }, [selectedOptionIndex, selectedPluginIndex, expandedPlugins, optionsMap, displayOptionsLimit]);

  const onEscape = useCallback(() => {
    nativeModules.panel.close();
    resetQuery();
  }, []);

  const onCommandComma = useCallback(() => {
    onEscape();
    nativeModules.panel.openSettings();
  }, []);

  const onTab = useCallback(() => {
    setSelectedOptionIndex(0);
    setSelectedPluginIndex(getNextPlugin(selectedPluginIndex, optionsMap));
  }, [selectedPluginIndex, optionsMap]);

  const onShiftTab = useCallback(() => {
    setSelectedOptionIndex(0);
    setSelectedPluginIndex(getPrevPlugin(selectedPluginIndex, optionsMap));
  }, [selectedPluginIndex, optionsMap]);

  /* OPTIONS NAVIGATON --------------------------------- */

  const getNextPlugin = (selectedPlugin: number, options: SpotterOptionWithPluginIdentifierMap): number => {
    const pluginsLength = Object.keys(options).length;
    const nextSelectedPlugin = selectedPlugin + 1 >= pluginsLength
      ? 0
      : selectedPlugin + 1;

    return nextSelectedPlugin;
  };

  const getPrevPlugin = (selectedPlugin: number, options: SpotterOptionWithPluginIdentifierMap): number => {
    const pluginsLength = Object.keys(options).length;
    const nextSelectedPlugin = selectedPlugin - 1 < 0
      ? pluginsLength - 1
      : selectedPlugin - 1;

    return nextSelectedPlugin;
  };

  const getNextOption = (
    selectedOption: number,
    selectedPlugin: number,
    expandedPlugins: number[],
    options: SpotterOptionWithPluginIdentifierMap,
    displayOptions: number,
  ): NextPluginOption => {
    const selectedPluginOptions = Object.values(options)[selectedPlugin];

    if (!selectedPluginOptions) {
      return { option: selectedOption, plugin: selectedPlugin };
    }

    const nextSelectedIndex = selectedOption + 1;
    const selectedPluginExpanded = expandedPlugins.filter(p => p === selectedPlugin).length;

    const maxSelectedOption = selectedPluginExpanded
      ? selectedPluginOptions.length - 1
      : (selectedPluginOptions.length <= displayOptions ? selectedPluginOptions.length - 1 : displayOptions);

    if (nextSelectedIndex > maxSelectedOption) {
      const plugin = getNextPlugin(selectedPlugin, options);
      return { option: 0, plugin };
    }

    return { option: nextSelectedIndex, plugin: selectedPlugin };
  };

  const getPrevOption = (
    selectedOption: number,
    selectedPlugin: number,
    expandedPlugins: number[],
    options: SpotterOptionWithPluginIdentifierMap,
    displayOptions: number,
  ): NextPluginOption => {
    const nextSelectedIndex = selectedOption - 1;

    if (nextSelectedIndex < 0) {
      const prevPlugin = getPrevPlugin(
        selectedPlugin,
        options,
      );
      const lastAvailableOption = getLastPluginOption(
        selectedPlugin,
        expandedPlugins,
        options,
        displayOptions,
      );

      return { option: lastAvailableOption, plugin: prevPlugin };
    }

    return { option: nextSelectedIndex, plugin: selectedPlugin };
  };

  const getLastPluginOption = (
    selectedPlugin: number,
    expandedPlugins: number[],
    options: SpotterOptionWithPluginIdentifierMap,
    displayOptions: number,
  ): number => {
    const prevPlugin = getPrevPlugin(selectedPlugin, options);
    const selectedPluginExpanded = expandedPlugins.filter(p => p === prevPlugin).length;
    const selectedOptions = Object.values(options)[prevPlugin];
    if (!selectedOptions) {
      return 0;
    }

    const lastAvailableOption = selectedPluginExpanded
      ? selectedOptions.length - 1
      : (selectedOptions.length - 1 <= displayOptions ? selectedOptions.length - 1 : displayOptions);

    return lastAvailableOption;
  };

  /* ------------------------------------------- */

  // const execAction = async (
  //   option: SpotterOption,
  //   options: SpotterCallbackOptions,
  //   selectedPlugin: number,
  // ) => {
  //   if (!option?.action) {
  //      return;
  //   };

  //   const pluginIdentifier: string = Object.keys(options)[selectedPlugin];

  //   registries.history.increaseOptionExecutionCounter(`${pluginIdentifier}#${option.title}`);

  //   setExecutingOption(true);

  //   const success = await option.action();

  //   if (typeof success === 'function') {
  //     console.log(success())
  //     return;
  //   }

  //   if (success || typeof success !== 'boolean') {
  //     nativeModules.panel.close();
  //     resetQuery();
  //   }

  //   setExecutingOption(false);
  // };

  const resetQuery = () => {
    setQuery('_');
    // TODO: Implement resetValue method for Input
    setTimeout(() => setQuery(''));
    setExpandedPlugins([]);
    setSelectedPluginIndex(0);
    setSelectedOptionIndex(0);
    setOptionsMap({});
    setExecutingOption(false);
  };

  return <>
    <SafeAreaView>
      <View style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        ...styles.input,
        ...(Object.keys(optionsMap).length ? styles.inputWithResults : {}),
      }}>
        <InputNative
          value={query}
          placeholder="Query..."
          disabled={executingOption}
          onChangeText={onChangeText}
          onSubmit={onSubmit}
          onArrowDown={onArrowDown}
          onArrowUp={onArrowUp}
          onEscape={onEscape}
          onCommandComma={onCommandComma}
          onTab={onTab}
          onShiftTab={onShiftTab}
        ></InputNative>
      </View>
      {Object.keys(optionsMap).length ?
        <Options
          style={{ ...styles.options, backgroundColor: colors.background }}
          selectedPlugin={selectedPluginIndex}
          selectedOption={selectedOptionIndex}
          executingOption={executingOption}
          displayOptions={displayOptionsLimit}
          options={optionsMap}
          expandedPlugins={expandedPlugins}
          onSubmit={o => null}
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
    // width: 615,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    marginBottom: 150,
  },
});

