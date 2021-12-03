import { Icon } from '@spotter-app/core';
import React, { useEffect, useRef } from 'react';
import {
  FlatList,
  Image,
  Text,
  View,
  ViewStyle,
  TouchableOpacity,
  ImageStyle,
} from 'react-native';
import { PluginOption } from '../../interfaces';
import { IconImage } from '../../native';
import { useTheme } from '../../providers';

type OptionsProps = {
  options: PluginOption[];
  hoveredOptionIndex: number;
  displayOptions: boolean,
  onSubmit: (index: number) => void;
  style: ViewStyle;
}

export const QueryPanelOptions = ({
  options,
  hoveredOptionIndex = 0,
  displayOptions = false,
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
    {displayOptions  ?
      <FlatList
        ref={refContainer}
        style={style}
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
      /> : null
    }
  </>
};

export const Option = ({
  option,
  active,
}: {
  option: PluginOption,
  active: boolean,
}) => {
  const { colors } = useTheme();

  return <View
    style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginLeft: 10,
      marginRight: 10,
      padding: 10,
      backgroundColor: active ? colors.active.background : colors.background,
      borderRadius: 10,
    }}
  >
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <OptionIcon icon={option.icon} style={{ marginRight: 5 }}></OptionIcon>
      <Text style={{
        color: active ? colors.active.text : colors.text,
        fontSize: 14,
      }}>{option.title}</Text>
    </View>
    {active &&
      <View>
        <OptionHotkeyHints option={option} style={{opacity: 0.5}}></OptionHotkeyHints>
      </View>
    }
  </View>
}

export const OptionIcon = ({ style, icon }: { style: ViewStyle & ImageStyle, icon?: Icon }) => {
  return <>
    {icon
      ? <View style={style}>
        {icon.endsWith('.app') || icon.endsWith('.prefPane')
          ? <IconImage style={{ width: 25, height: 25, ...style, }} source={icon}></IconImage>
          : icon.endsWith('.png') || icon.endsWith('.jpg') || icon.endsWith('.jpeg')
            ? <Image style={{ width: 22, height: 22, ...style }} source={{ uri: icon }}></Image>
            : null
        }
      </View>
      : null
  }
  </>
};

export const OptionHotkeyHints = ({
  option,
  style,
}: {
  option: PluginOption,
  style?: ViewStyle,
}) => {
  return <View style={{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    ...(style ? style : {}),
  }}>
    {option?.tabActionId
      ? <OptionHotkeyHint style={{}} placeholder={'tab'}></OptionHotkeyHint>
      : null
    }
    {option?.actionId
      ? <OptionHotkeyHint style={{marginLeft: 5}} placeholder={'enter'}></OptionHotkeyHint>
      : null
    }
  </View>
};

export const OptionHotkeyHint = ({
  style,
  placeholder,
}: {
  style: ViewStyle,
  placeholder: string,
}) => {
  const { colors } = useTheme();

  return <View style={{
    backgroundColor: colors.active.highlight,
    padding: 5,
    paddingLeft: 7,
    paddingRight: 7,
    borderRadius: 5,
    ...style,
  }}>
    <Text style={{fontSize: 10, opacity: 0.7, color: colors.active.text}}>{placeholder}</Text>
  </View>
};
