import { Icon } from '@spotter-app/core';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Text,
  View,
  ViewStyle,
  TouchableOpacity,
  ImageStyle,
  Animated,
} from 'react-native';
import { Subscription } from 'rxjs';
import { PluginOnQueryOption, PluginRegistryOption, SpotterThemeColors } from './interfaces';
import { IconImage } from './native';
import { useSettings } from './providers';

type OptionsProps = {
  options: Array<PluginOnQueryOption | PluginRegistryOption>;
  hoveredOptionIndex: number;
  onSubmit: (index: number) => void;
  style: Animated.WithAnimatedObject<ViewStyle>;
}

export const QueryPanelOptions = ({
  options,
  hoveredOptionIndex = 0,
  onSubmit,
  style,
}: OptionsProps) => {

  const refContainer = useRef<FlatList | null>(null);

  useEffect(() => {
    if (refContainer.current && options?.length) {
      const offset = 10;
      const indexWithOffset = hoveredOptionIndex - offset;
      const index = indexWithOffset < 0 ? 0 : indexWithOffset;

      if (!options[index]) {
        return;
      }

      refContainer.current.scrollToIndex({ animated: true, index });
    }
  });

  return <>
    <Animated.View style={style}>
      <FlatList
        ref={refContainer}
        data={options}
        keyExtractor={(item, i) => item.title + i}
        persistentScrollbar={true}
        onScrollToIndexFailed={() => null}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => onSubmit(index)}>
            <Option
              option={item}
              active={hoveredOptionIndex === index}
            />
          </TouchableOpacity>
        )}
      />
    </Animated.View>
  </>
};

export const Option = ({
  option,
  active,
}: {
  option: PluginOnQueryOption | PluginRegistryOption,
  active: boolean,
}) => {
  const { colors$ } = useSettings();
  const [colors, setColors] = useState<SpotterThemeColors>();

  const subscriptions: Subscription[] = [];

  useEffect(() => {
    subscriptions.push(
      colors$.subscribe(setColors),
    );
  }, []);

  useEffect(() => {
    return () => subscriptions.forEach(s => s.unsubscribe());
  }, []);

  const subtitle = option.subtitle
    ? `${option.subtitle.slice(0, 45)} ${option.subtitle.length > 44 ? '...' : ''}`
    : null;

  return <View
    style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginLeft: 10,
      marginRight: 10,
      padding: 8,
      backgroundColor: active ? colors?.hoveredOptionBackground : colors?.background,
      borderRadius: 10,
    }}
  >
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <OptionIcon icon={option.icon} style={{ marginRight: 5, height: 25 }}></OptionIcon>
      <Text style={{
        color: active ? colors?.hoveredOptionText : colors?.text,
        fontSize: 14,
      }}>{option.title}</Text>

      {subtitle &&
        <Text style={{
          opacity: 0.3,
          color: active ? colors?.hoveredOptionText : colors?.text,
          fontSize: 14,
        }}> ― {subtitle}</Text>
      }
    </View>
    {active &&
      <View>
        <OptionHotkeyHints colors={colors} option={option} style={{
          marginRight: 2,
        }}></OptionHotkeyHints>
      </View>
    }
  </View>
};

export const OptionIcon = ({ style, icon }: { style?: ViewStyle & ImageStyle, icon?: Icon }) => { return <>
    {icon
      ? <View style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 25,
          height: 25,
        }}>
          {icon.endsWith('.app') || icon.endsWith('.prefPane')
            ? <IconImage style={{ width: 25, height: 25 }} source={icon}></IconImage>
            : icon.endsWith('.png') || icon.startsWith('https://') || icon.startsWith('http://')
              ? <Image style={{ width: 22, height: 22 }} source={{ uri: icon }}></Image>
              : <Text style={{ margin: 'auto' }}>{icon}</Text>
          }
        </View>
      : <View style={style} />
  }
  </>
};

export const OptionHotkeyHints = ({
  option,
  colors,
  style,
}: {
  option: PluginOnQueryOption | PluginRegistryOption,
  style?: ViewStyle,
  colors?: SpotterThemeColors,
}) => {
  return <View style={{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    ...(style ? style : {}),
  }}>
    {option?.onQueryId
      ? <OptionHotkeyHint colors={colors} style={{}} placeholder={'tab'}></OptionHotkeyHint>
      : null
    }
    {option?.onSubmitId
      ? <OptionHotkeyHint colors={colors} style={{marginLeft: 5}} placeholder={'enter'}></OptionHotkeyHint>
      : null
    }
  </View>
};

export const OptionHotkeyHint = ({
  style,
  placeholder,
  colors,
}: {
  style: ViewStyle,
  placeholder: string,
  colors?: SpotterThemeColors,
}) => {

  return <View style={{
    backgroundColor: colors?.background,
    opacity: 0.2,
    padding: 5,
    paddingLeft: 7,
    paddingRight: 7,
    borderRadius: 5,
    ...style,
  }}>
    <Text style={{
      fontSize: 10,
      color: colors?.text,
    }}>{placeholder}</Text>
  </View>
};
