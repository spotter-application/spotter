import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { useApi, useTheme } from '../components';
import { OptionIcon, Options } from '../components/options.component';
import { SpotterOptionWithPluginIdentifierMap, SpotterOption, SPOTTER_HOTKEY_IDENTIFIER, SpotterOptionWithPluginIdentifier } from '../core';
import { InputNative } from '../native';
import {
  AppDimensionsPlugin,
  ApplicationsPlugin,
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

interface NextPluginOption {
  option: number;
  plugin: number;
};

export const App: FC<{}> = () => {

  const { api, registries } = useApi();
  const { colors } = useTheme();
  const [query, setQuery] = useState<string>('');
  const [optionsMap, setOptionsMap] = useState<SpotterOptionWithPluginIdentifierMap>({});
  const [selectedPluginIndex, setSelectedPluginIndex] = useState<number>(0);
  const [expandedPlugins, setExpandedPlugins] = useState<number[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);
  const [executingOption, setExecutingOption] = useState<boolean>(false);
  const [displayOptionsLimit] = useState<number>(3);
  const [firstOption, setFirstOption] = useState<SpotterOption | null>(null);

  const [activeOption, setActiveOption] = useState<SpotterOptionWithPluginIdentifier | null>(null)

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

    api.globalHotKey.onPress(async (e) => {
      if (e.identifier === SPOTTER_HOTKEY_IDENTIFIER) {
        registries.plugins.onOpenSpotter();
        api.panel.open();
        return;
      };
    });

    subscriptions.forEach(s => s.unsubscribe());

    subscriptions.push(registries.plugins.currentOptionsMap$.subscribe(nextOptionsMap => {
      const nextOptions = nextOptionsMap ? Object.values(nextOptionsMap) : [];
      setFirstOption(nextOptions[0] && nextOptions[0][0] ? nextOptions[0][0] : null);

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

    subscriptions.push(registries.plugins.activeOption$.subscribe(o => setActiveOption(o)));

    subscriptions.push(api.queryInput.value$.pipe(distinctUntilChanged()).subscribe(query => {
      setQuery(query);
      registries.plugins.findOptionsForQuery(query);
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

    api.queryInput.setValue(q);
  }, [executingOption, selectedPluginIndex, selectedOptionIndex]);

  const onSubmit = useCallback((p?: number, o?: number) => {
    const pluginIndex = typeof p === 'number' ? p : selectedPluginIndex;
    const optionIndex = typeof o === 'number' ? o : selectedOptionIndex;

    const selectedPluginExpanded = expandedPlugins.filter(p => p === pluginIndex).length;
    const selectedExpandAction = !selectedPluginExpanded && optionIndex >= displayOptionsLimit;

    if (selectedExpandAction) {
      setExpandedPlugins([...expandedPlugins, pluginIndex]);
      return;
    }

    const pluginOptions = Object.values(optionsMap)[pluginIndex];

    if (!pluginOptions) {
      return;
    }

    const selectedOption: SpotterOption = pluginOptions[optionIndex];

    if (!selectedOption) {
      return;
    }

    setExecutingOption(true);

    const pluginIdentifier: string = Object.keys(optionsMap)[pluginIndex];

    registries.plugins.executeOption({...selectedOption, pluginIdentifier }, (success: boolean) => {
      if (success || typeof success !== 'boolean') {
        api.panel.close();
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
    api.panel.close();
    resetQuery();
  }, []);

  const onCommandComma = useCallback(() => {
    onEscape();
    api.panel.openSettings();
  }, []);

  const onTab = useCallback(() => {
    const pluginOptions = Object.values(optionsMap)[selectedPluginIndex];

    if (!pluginOptions) {
      return;
    }

    const selectedOption: SpotterOption = pluginOptions[selectedOptionIndex];

    if (!selectedOption || !selectedOption.onQuery) {
      return;
    }

    const pluginIdentifier: string = Object.keys(optionsMap)[selectedPluginIndex];

    registries.plugins.selectOption({...selectedOption, pluginIdentifier });

    setQuery(' ');
    // TODO: Implement resetValue method for Input
    setTimeout(() => setQuery(''));

    registries.plugins.findOptionsForQuery('');
    setSelectedOptionIndex(0);
    setSelectedPluginIndex(0);

  }, [selectedPluginIndex, optionsMap]);

  const onShiftTab = useCallback(() => {
    setSelectedOptionIndex(0);
    setSelectedPluginIndex(getPrevPlugin(selectedPluginIndex, optionsMap));
  }, [selectedPluginIndex, optionsMap]);

  const onBackspace = useCallback((prevText: string) => {
    if (prevText.length) {
      return;
    }

    registries.plugins.selectOption(null);

    resetQuery();
  }, [selectedPluginIndex, optionsMap]);

  const onSelectAndSubmit = useCallback((pluginIndex, optionIndex) => {
    setSelectedOptionIndex(optionIndex);
    setSelectedPluginIndex(pluginIndex);
    onSubmit(pluginIndex, optionIndex);
  }, [optionsMap, selectedOptionIndex, selectedPluginIndex, expandedPlugins]);

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

  const resetQuery = () => {
    setQuery('_');
    // TODO: Implement resetValue method for Input
    setTimeout(() => setQuery(''));
    setExpandedPlugins([]);
    setSelectedPluginIndex(0);
    setSelectedOptionIndex(0);
    setOptionsMap({});
    setExecutingOption(false);
    setFirstOption(null);
    registries.plugins.selectOption(null);
  };

  return <>
    <SafeAreaView>
      <View style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        ...styles.input,
        ...(Object.keys(optionsMap).length ? styles.inputWithResults : {}),
        display: 'flex',
        flexDirection: 'row',
      }}>
        {
          activeOption ?
            <View style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.active.border,
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
          placeholder="Query..."
          disabled={executingOption}
          hint={firstOption?.title}
          onChangeText={onChangeText}
          onSubmit={onSubmit}
          onArrowDown={onArrowDown}
          onArrowUp={onArrowUp}
          onEscape={onEscape}
          onCommandComma={onCommandComma}
          onTab={onTab}
          onShiftTab={onShiftTab}
          onBackspace={onBackspace}
        ></InputNative>
        {
          firstOption ? <>
            <OptionIcon style={{}} icon={firstOption.icon}></OptionIcon>
          </> : null
        }
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
          onSubmit={(p, o) => onSelectAndSubmit(p, o)}
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
    paddingBottom: 10,
  },
});

