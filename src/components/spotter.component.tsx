import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Subscription } from 'rxjs';
import { useApi, useTheme } from '../providers';
import { OptionHotkeyHints, OptionIcon, Options } from './options.component';
import { SpotterPluginOption } from '../core';
import { InputNative } from '../core/native';

const subscriptions: Subscription[] = [];

export const QueryPanel: FC<{}> = () => {

  const { api, registries, state } = useApi();
  const { colors } = useTheme();
  const [query, setQuery] = useState<string>('');
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
  const [options, setOptions] = useState<SpotterPluginOption[]>([]);
  const [optionsDisplayedWithDelay, setOptionsDisplayedWithDelay] = useState<boolean>(false);
  const [hoveredOptionIndex, setHoveredOptionIndex] = useState<number>(0);
  const [executingOption, setExecutingOption] = useState<boolean>(false); // TODO
  const [activeOption, setActiveOption] = useState<SpotterPluginOption | null>(null)

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    subscriptions.forEach(s => s.unsubscribe());

    subscriptions.push(
      state.query$.subscribe(value => setQuery(value)),
      state.options$.subscribe(value => setOptions(value)),
      state.loadingOptions$.subscribe(value => setLoadingOptions(value)),
      state.optionsDisplayedWithDelay$.subscribe(value => setOptionsDisplayedWithDelay(value)),
      state.activeOption$.subscribe(value => setActiveOption(value)),
      state.hoveredOptionIndex$.subscribe(value => setHoveredOptionIndex(value)),
    );
  };

  /* CALLBACKS --------------------------------- */

  const onChangeText = useCallback(async q => {
    if (q === '') {
      state.reset();
    }

    if (executingOption) {
      return;
    }

    state.query = q;
  }, [executingOption]);

  const onSubmit = useCallback(async () => {
    const option: SpotterPluginOption = state.options[state.hoveredOptionIndex];

    if (!option?.action) {
      return;
    }

    setExecutingOption(true);

    registries.history.increaseOptionHistory(
      [
        ...(state.activeOption ? [state.activeOption.title] : []),
        option.title,
      ],
      state.query,
    );

    const success = await option.action();

    if (success || typeof success !== 'boolean') {
      api.panel.close();
      state.reset();
    }

    setExecutingOption(false);
  }, []);

  const onArrowUp = useCallback(() => {
    state.hoveredOptionIndex = getPrevOptionIndex(state.hoveredOptionIndex, state.options);
  }, []);

  const onArrowDown = useCallback(() => {
    state.hoveredOptionIndex = getNextOptionIndex(state.hoveredOptionIndex, state.options);
  }, []);

  const onEscape = useCallback(() => {
    api.panel.close();
    state.reset();
  }, []);

  const onCommandComma = useCallback(() => {
    onEscape();
    api.panel.openSettings();
  }, []);

  const onTab = useCallback(() => {
    const option: SpotterPluginOption = state.options[state.hoveredOptionIndex];

    if (!option || !option.onQuery) {
      return;
    }

    state.activeOption = option;
  }, []);

  const onBackspace = useCallback((prevText: string) => {
    if (prevText.length) {
      return;
    }

    state.activeOption = null;

    state.reset();
  }, []);

  const onSelectAndSubmit = useCallback((index: number) => {
    state.hoveredOptionIndex = index;
    onSubmit();
  }, []);

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

  const getHint = useCallback(() => {
    if (!state.options.length) {
      return '';
    }

    const { title } = state.options[state.hoveredOptionIndex];

    const query = state.query.toLocaleLowerCase();
    const hint = title
      .toLocaleLowerCase()
      .split(' ')
      .find(value => value.startsWith(query));

    if (!hint) {
      return '';
    }

    return hint;
  }, [])


  return <>
    <SafeAreaView>
      <View style={{
        backgroundColor: colors.background,
        ...styles.input,
        ...(optionsDisplayedWithDelay && options?.length ? styles.inputWithResults : {}),
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        {
          activeOption ?
          // TODO: Create component
            <View style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.active.highlight,
              paddingLeft: 10,
              paddingRight: 10,
              borderRadius: 10,
              marginRight: 5,
              padding: 5,
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

        <OptionHotkeyHints option={state.options[state.hoveredOptionIndex]}></OptionHotkeyHints>

        <View style={{marginLeft: 10}}>
          {loadingOptions
            ? <ActivityIndicator size="small" color={colors.active.highlight} />
            : options.length && !activeOption
              ? <OptionIcon style={{}} icon={options[hoveredOptionIndex].icon}></OptionIcon>
              : null
          }
        </View>

      </View>
      {optionsDisplayedWithDelay ?
        <Options
          style={{ ...styles.options, backgroundColor: colors.background }}
          hoveredOptionIndex={hoveredOptionIndex}
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
    height: 510,
  },
});
