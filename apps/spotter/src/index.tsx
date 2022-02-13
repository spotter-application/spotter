import React, { FC, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { OptionIcon, QueryPanelOptions } from './options';
import { combineLatest, distinctUntilChanged, map, Subscription } from 'rxjs';
import { Option } from '@spotter-app/core';
import { PluginOnQueryOption, PluginRegistryOption, SpotterThemeColors } from './interfaces';
import { useEvents, useSettings, useSpotterState } from './providers';
import { Input } from './native';
import { getHint } from './helpers';

export const QueryPanelLoading: FC<{
  doing: string | null,
  colors?: SpotterThemeColors,
}> = ({ doing, colors }) => {
  return <View style={{
    opacity: 0.75,
    position: 'absolute',
    right: 3,
    top: -8,
    zIndex: 100,
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    {doing &&
      <Text style={{
        fontSize: 14,
        color: colors?.text,
        paddingRight: 30,
      }}>{doing}</Text>
    }
    <ActivityIndicator
      size="small"
      color={colors?.text}
      style={{
        position: 'absolute',
        right: 3,
        top: -1,
        opacity: 0.3,
      }}
    />
  </View>
}

export const QueryPanelSystemOption: FC<{
  systemOption: Option,
  colors?: SpotterThemeColors,
}> = ({ systemOption, colors }) => {
  return <TouchableOpacity style={{
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: colors?.hoveredOptionBackground,
  }} onPress={systemOption.onSubmit}>
    <Text style={{
      fontSize: 12,
    }}>{systemOption.title}</Text>
    <View style={{
      marginTop: 2,
      margin: 'auto',
      alignItems: 'flex-end',
    }}>
      <Text style={{
        fontSize: 9,
        opacity: 0.5,
      }}>{systemOption.subtitle}</Text>
    </View>

    <View style={{
      position: 'absolute',
      left: 4,
      bottom: 3.2,
      backgroundColor: colors?.background,
      opacity: 0.3,
      padding: 1,
      paddingLeft: 4,
      paddingRight: 4,
      borderRadius: 5,
    }}>
      <Text style={{
        fontSize: 8,
        color: colors?.text,
      }}>cmd + u</Text>
    </View>
  </TouchableOpacity>
}

export const QueryPanelSelectedOption: FC<{
  selectedOption: PluginOnQueryOption | PluginRegistryOption | null,
  selectedOptionLeftAnim: Animated.Value,
  style: Animated.WithAnimatedObject<ViewStyle>,
  colors?: SpotterThemeColors,
}> = ({ colors, selectedOption, style, selectedOptionLeftAnim }) => {
  return <Animated.View style={style}>
    <OptionIcon
      style={{
        height: 25,
      }}
      icon={selectedOption?.icon}
    ></OptionIcon>
    <Animated.Text style={{
      fontSize: 16,
      color: colors?.activeOptionText,
      paddingLeft: 5,
    }}>{selectedOption?.title}</Animated.Text>
  </Animated.View>
}

export const QueryPanel: FC<{}> = () => {

  const {
    onQuery,
    onSubmit,
    onArrowUp,
    onArrowDown,
    onEscape,
    onCommandKey,
    onTab,
    onBackspace,
  } = useEvents();

  const {
    options$,
    placeholder$,
    loading$,
    query$,
    hoveredOptionIndex$,
    selectedOption$,
    systemOption$,
    doing$,
  } = useSpotterState();

  const { colors$ } = useSettings();

  const [options, setOptions] = useState<PluginOnQueryOption[] | PluginRegistryOption[]>([]);
  const [placeholder, setPlaceholder] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean | string>(false);
  const [doing, setDoing] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [hoveredOptionIndex, setHoveredOptionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<PluginOnQueryOption | PluginRegistryOption | null>(null);
  const [colors, setColors] = useState<SpotterThemeColors>();
  const [systemOption, setSystemOption] = useState<Option | null>();

  const heightAnim = useRef(new Animated.Value(0)).current;
  const borderRadiusAnim = useRef(new Animated.Value(10)).current;
  const selectedOptionLeftAnim = useRef(new Animated.Value(-20)).current;

  const subscriptions: Subscription[] = [];

  useEffect(() => {
    subscriptions.push(
      combineLatest([query$, options$, selectedOption$]).pipe(
        map(([_, options, so]) => !!options.length || !!so),
        distinctUntilChanged(),
      ).subscribe(displayOptions => {
        const timing = Animated.timing;
        if (displayOptions) {
          borderRadiusAnim.setValue(0);
          heightAnim.setValue(100);
          Animated.parallel([timing(heightAnim, {
            toValue: 450,
            duration: 100,
            useNativeDriver: false,
          })]).start();

          Animated.delay(50).start(() => {
            Animated.parallel([timing(heightAnim, {
              toValue: 500,
              duration: 100,
              useNativeDriver: false
            })]).start();
          });
        } else {
          const timing = Animated.timing;
          Animated.parallel([
            timing(heightAnim, {
              toValue: 0,
              duration: 150,
              useNativeDriver: false,
            }),
            timing(borderRadiusAnim, {
              toValue: 10,
              duration: 0,
              delay: 150,
              useNativeDriver: false,
            })
          ]).start();
        }
      }),
      options$.subscribe(setOptions),
      placeholder$.subscribe(setPlaceholder),
      loading$.subscribe(setLoading),
      doing$.subscribe(setDoing),
      query$.subscribe(setQuery),
      hoveredOptionIndex$.subscribe(setHoveredOptionIndex),
      selectedOption$.subscribe(option => {
        setSelectedOption(option);

        const timing = Animated.timing;
        if (option) {
          selectedOptionLeftAnim.setValue(-20);
          Animated.parallel([timing(selectedOptionLeftAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: false,
          })]).start();
        } else {
          Animated.parallel([timing(selectedOptionLeftAnim, {
            toValue: -20,
            duration: 100,
            useNativeDriver: false,
          })]).start();

        }
      }),
      colors$.subscribe(setColors),
      systemOption$.subscribe(setSystemOption),
    );
  }, [heightAnim, borderRadiusAnim]);

    useEffect(() => {
      return () => subscriptions.forEach(s => s.unsubscribe());
    }, []);

  const placeholderValue = placeholder?.length
    ? placeholder
    : selectedOption
      ? `${selectedOption.title} search`
      : 'Spotter search';

  return <>
    <SafeAreaView>
      <Animated.View style={{
        backgroundColor: colors?.background,
        ...styles.input,
        borderBottomLeftRadius: borderRadiusAnim,
        borderBottomRightRadius: borderRadiusAnim,
      }}>
        <QueryPanelSelectedOption
          selectedOptionLeftAnim={selectedOptionLeftAnim}
          style={{
            ...styles.selectedOptionContainer,
            backgroundColor: colors?.activeOptionBackground,
            // left: selectedOptionLeftAnim,
            overflow: 'hidden',
            paddingLeft: selectedOptionLeftAnim.interpolate({
              inputRange: [-20, 0],
              outputRange: [0, 10],
            }),
            marginLeft: selectedOptionLeftAnim.interpolate({
              inputRange: [-20, 0],
              outputRange: [0, 5],
            }),
            paddingRight: selectedOptionLeftAnim.interpolate({
              inputRange: [-20, 0],
              outputRange: [0, 10],
            }),
            opacity: selectedOptionLeftAnim.interpolate({
              inputRange: [-20, 0],
              outputRange: [0, 1],
            }),
          }}
          colors={colors}
          selectedOption={selectedOption}
        />
        <Input
          style={{
            color: colors?.text,
            // backgroundColor: 'yellow',
          }}
          color={colors?.text}
          background={colors?.background}
          value={query}
          placeholder={placeholderValue}
          hint={getHint(query, options[hoveredOptionIndex])}
          onChangeText={onQuery}
          onSubmit={onSubmit}
          onArrowDown={onArrowDown}
          onArrowUp={onArrowUp}
          onEscape={onEscape}
          onCommandKey={onCommandKey}
          onTab={onTab}
          onBackspace={onBackspace}
        ></Input>
        <View style={{
          display: 'flex',
          marginLeft: 10,
        }}>
          {(loading || doing) &&
            <QueryPanelLoading
              doing={doing}
              colors={colors}
            />
          }
          {(!loading && systemOption) &&
            <QueryPanelSystemOption
              systemOption={systemOption}
              colors={colors}
            />
          }
        </View>
      </Animated.View>
      <QueryPanelOptions
        style={{
          ...styles.options,
          backgroundColor: colors?.background,
          height: heightAnim,
          paddingTop: 0,
          paddingBottom: 0,
        }}
        hoveredOptionIndex={hoveredOptionIndex}
        options={options}
        onSubmit={onSubmit}
      ></QueryPanelOptions>
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
    paddingVertical: 8,
    paddingRight: 10,
    paddingLeft: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  options: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    paddingTop: 10,
    paddingBottom: 10,
    height: 510,
  },
  selectedOptionContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 10,
    marginRight: 5,
    padding: 5,
  }
});
