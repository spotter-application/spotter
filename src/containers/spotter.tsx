import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { useApi, useTheme } from '../components';
import { Options } from '../components/options.component';
import { SpotterCallbackOptions, SpotterOption, SPOTTER_HOTKEY_IDENTIFIER } from '../core';
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

interface NextPluginOption {
  option: number;
  plugin: number;
};

export const App: FC<{}> = () => {

  const { nativeModules, registries } = useApi();
  const { colors } = useTheme();
  const [query, setQuery] = useState<string>('');
  const [options, setOptions] = useState<SpotterCallbackOptions>({});
  const [selectedPlugin, setSelectedPlugin] = useState<number>(0);
  const [expandedPlugins, setExpandedPlugins] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [executingOption, setExecutingOption] = useState<boolean>(false);
  const [displayOptions] = useState<number>(3);

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
      }); }); nativeModules.globalHotKey.onPress(async (e) => {
      if (e.identifier === SPOTTER_HOTKEY_IDENTIFIER) {
        registries.plugins.onOpenSpotter();
        nativeModules.panel.open();
        return;
      }

      // const [plugin, option] = e.identifier.split('#');
      // const options = registries.plugins.options[plugin];
      // if (options?.length) {
      //   await options.find(o => o.title === option)?.action();
      // }
    });
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

    registries.plugins.findOptionsForQuery(convertedLayoutQuery, (forQuery, nextOptions) => {
      const nextOptionsValues = Object.values(nextOptions);
      const selectedPluginNextOptions = nextOptionsValues[selectedPlugin];

      if (!selectedPluginNextOptions || !selectedPluginNextOptions[selectedOption]) {
        setSelectedOption(0);
      }

      if (selectedPlugin >= nextOptionsValues.length) {
        setSelectedPlugin(0);
      }

      setOptions(nextOptions)
    });
  }, [executingOption, selectedPlugin, selectedOption]);

  const onSubmit = useCallback(() => {
    const selectedPluginExpanded = expandedPlugins.filter(p => p === selectedPlugin).length;
    const selectedExpandAction = !selectedPluginExpanded && selectedOption >= displayOptions;

    if (selectedExpandAction) {
      setExpandedPlugins([...expandedPlugins ,selectedPlugin]);
      return;
    }

    const pluginOptions = Object.values(options)[selectedPlugin];

    if (!pluginOptions) {
      return;
    }

    const option: SpotterOption = pluginOptions[selectedOption];
    if (option) {
      execAction(option, options, selectedPlugin);
    }
  }, [options, selectedOption, selectedPlugin, expandedPlugins]);

  const onArrowUp = useCallback(() => {
    const { option, plugin } = getPrevOption(selectedOption, selectedPlugin, expandedPlugins, options, displayOptions);
    setSelectedOption(option);
    setSelectedPlugin(plugin);
  }, [selectedOption, selectedPlugin, expandedPlugins, options, displayOptions]);

  const onArrowDown = useCallback(() => {
    const { option, plugin } = getNextOption(selectedOption, selectedPlugin, expandedPlugins, options, displayOptions);
    setSelectedOption(option);
    setSelectedPlugin(plugin);
  }, [selectedOption, selectedPlugin, expandedPlugins, options, displayOptions]);

  const onEscape = useCallback(() => {
    nativeModules.panel.close();
    resetQuery();
  }, []);

  const onCommandComma = useCallback(() => {
    onEscape();
    nativeModules.panel.openSettings();
  }, []);

  const onTab = useCallback(() => {
    setSelectedOption(0);
    setSelectedPlugin(getNextPlugin(selectedPlugin, options));
  }, [selectedPlugin, options]);

  const onShiftTab = useCallback(() => {
    setSelectedOption(0);
    setSelectedPlugin(getPrevPlugin(selectedPlugin, options));
  }, [selectedPlugin, options]);

  /* OPTIONS NAVIGATON --------------------------------- */

  const getNextPlugin = (selectedPlugin: number, options: SpotterCallbackOptions): number => {
    const pluginsLength = Object.keys(options).length;
    const nextSelectedPlugin = selectedPlugin + 1 >= pluginsLength
      ? 0
      : selectedPlugin + 1;

    return nextSelectedPlugin;
  };

  const getPrevPlugin = (selectedPlugin: number, options: SpotterCallbackOptions): number => {
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
    options: SpotterCallbackOptions,
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
    options: SpotterCallbackOptions,
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
    options: SpotterCallbackOptions,
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

  const execAction = async (
    option: SpotterOption,
    options: SpotterCallbackOptions,
    selectedPlugin: number,
  ) => {
    if (!option?.action) {
       return;
    };

    const pluginIdentifier: string = Object.keys(options)[selectedPlugin];

    registries.history.increaseOptionExecutionCounter(`${pluginIdentifier}#${option.title}`);

    setExecutingOption(true);

    const success = await option.action();

    if (success || typeof success !== 'boolean') {
      nativeModules.panel.close();
      resetQuery();
    }

    setExecutingOption(false);
  };

  const resetQuery = () => {
    setQuery('_');
    // TODO: Implement resetValue method for Input
    setTimeout(() => setQuery(''));
    setExpandedPlugins([]);
    setSelectedPlugin(0);
    setSelectedOption(0);
    setOptions({});
    setExecutingOption(false);
  };

  return <>
    <SafeAreaView>
      <View style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        ...styles.input,
        ...(Object.keys(options).length ? styles.inputWithResults : {}),
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
      {Object.keys(options).length ?
        <Options
          style={{ ...styles.options, backgroundColor: colors.background }}
          selectedPlugin={selectedPlugin}
          selectedOption={selectedOption}
          executingOption={executingOption}
          displayOptions={displayOptions}
          options={options}
          expandedPlugins={expandedPlugins}
          onSubmit={o => execAction(o, options, selectedPlugin)}
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

