import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Text, View, ViewStyle, TouchableOpacity, ImageStyle } from 'react-native';
import { SpotterOptionBaseImage, SpotterPluginOption } from '../core';
import { IconImageNative } from '../core/native';
import { useTheme } from '../providers';

type OptionsProps = {
  options: SpotterPluginOption[];
  hoveredOptionIndex: number;
  executingOption: boolean,
  onSubmit: (index: number) => void;
  style: ViewStyle;
}

export const Options = ({
  options,
  hoveredOptionIndex,
  executingOption,
  onSubmit,
  style,
}: OptionsProps) => {

  const refContainer = useRef<FlatList | null>(null);

  useEffect(() => {
    if (refContainer.current && options?.length) {
      const offset = 10;
      const indexWithOffset = hoveredOptionIndex - offset;
      const index = indexWithOffset < 0 ? 0 : indexWithOffset;
      refContainer.current.scrollToIndex({ animated: true, index });
    }
  });

  return <>
    {options?.length ?
      <FlatList
        ref={refContainer}
        style={style}
        data={options}
        keyExtractor={(item) => item.title}
        persistentScrollbar={true}
        onScrollToIndexFailed={() => null}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => onSubmit(index)}>
            <Option
              option={item}
              active={hoveredOptionIndex === index}
              executing={hoveredOptionIndex === index && executingOption}
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
  executing,
}: {
  option: SpotterPluginOption,
  active: boolean,
  executing: boolean,
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
      <Text style={{color: colors.text, fontSize: 14}}>{option.title}</Text>
    </View>
    {!active &&
      <View>
        <OptionHotkeyHints option={option} style={{opacity: 0.5}}></OptionHotkeyHints>
      </View>
    }
  </View>
}

export const OptionIcon = ({ style, icon }: { style: ViewStyle & ImageStyle, icon: SpotterOptionBaseImage }) => {
  return <>
    {icon
      ? <View style={style}>
        {typeof icon === 'string' && (icon.endsWith('.app') || icon.endsWith('.prefPane'))
          ? <IconImageNative style={{ width: 25, height: 25, ...style, }} source={icon}></IconImageNative>
          : typeof icon === 'number' || (typeof icon === 'object' && icon.uri)
            ? <Image style={{ width: 22, height: 22, ...style }} source={icon}></Image>
            : <Text>{icon}</Text>
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
  option: SpotterPluginOption,
  style?: ViewStyle,
}) => {
  return <View style={{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    ...(style ? style : {}),
  }}>
    {option?.onQuery
      ? <OptionHotkeyHint style={{}} placeholder={'tab'}></OptionHotkeyHint>
      : null
    }
    {option?.action
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
    backgroundColor: colors.highlight,
    padding: 5,
    paddingLeft: 7,
    paddingRight: 7,
    borderRadius: 5,
    ...style,
  }}>
    <Text style={{fontSize: 10, opacity: 0.5, color: colors.text}}>{placeholder}</Text>
  </View>
};

      //  <View
      //   key={item[0]}
      //  >
      //   {(item[1] === 'loading' || item[1]?.length) ?
      //    <View key={item[0]} style={{ paddingLeft: 10, paddingRight: 10 }}>
      //      <View style={{
      //        height: dimensions.pluginTitle,
      //        marginTop: index ? dimensions.pluginMarginTop : 0,
      //        display: 'flex',
      //        alignItems: 'center',
      //        flexDirection: 'row',
      //      }}>
      //         <Text style={{ fontSize: 11, paddingLeft: 10, paddingBottom: 5, opacity: 0.3 }}>{item[0]}</Text>
      //      </View>
      //     {item[1] === 'loading'
      //       // ? <ActivityIndicator size="small" color="#ffffff" />
      //       ? null
      //       : item[1]?.map((option: SpotterOption, optionIndex: number) => (
      //           optionIndex < (expandedPlugins.filter(p => p === index).length ? 1000 : displayOptions) ?
      //             <View
      //               key={item[0] + option.title}
      //               style={{
      //                 height: dimensions.option,
      //                 paddingLeft: 10,
      //                 paddingRight: 10,
      //                 backgroundColor: (index === selectedPlugin && optionIndex === selectedOption)
      //                   ? colors.active.background
      //                   : 'transparent', borderRadius: 10,
      //                 display: 'flex',
      //                 flexDirection: 'row',
      //                 alignItems: 'center',
      //                 justifyContent: 'space-between',
      //               }}
      //             >
      //               <TouchableOpacity onPress={() => onSubmit(index, optionIndex)} style={{
      //                 display: 'flex',
      //                 flex: 1,
      //                 flexDirection: 'row',
      //                 alignItems: 'center',
      //               }}>
      //                 <OptionIcon icon={option?.icon} style={{ marginRight: 5 }}/>
      //                 <Text
      //                   style={{
      //                     fontSize: 13,
      //                     color: (index === selectedPlugin && optionIndex === selectedOption)
      //                       ? colors.active.text
      //                       : colors.text,
      //                     borderRadius: 10,
      //                   }}
      //                 >{option.title}</Text>
      //               </TouchableOpacity>
      //               {
      //                 (index === selectedPlugin && optionIndex === selectedOption)
      //                   ? <>
      //                     <Text
      //                       style={{
      //                         fontSize: 10,
      //                         color: (index === selectedPlugin && optionIndex === selectedOption)
      //                           ? colors.active.text
      //                           : colors.text,
      //                         opacity: 0.3,
      //                         marginLeft: 'auto',
      //                         // marginLeft: 10,
      //                       }}
      //                     >{option.subtitle}</Text>
      //                     <OptionKey style={{ marginLeft: 5, marginRight: 5 }} placeholder={'enter'}></OptionKey>
      //                     { option.onQuery ? <OptionKey placeholder={'tab'}></OptionKey> : null }
      //                   </>
      //                   : null
      //               }
      //             </View>
      //             : null
      //         ))
      //     }
      //   </View> : null}
      // </View>

          // {item[1] !== 'loading' && item[1]?.length > displayOptions && !expandedPlugins.filter(e => e === index).length
          //   ? <TouchableOpacity onPress={() => onSubmit(index, displayOptions)} style={{
          //     backgroundColor: selectedOption === displayOptions && selectedPlugin === index
          //       ? colors.active.background
          //       : colors.active.border,
          //     borderRadius: 10,
          //     display: 'flex',
          //     flexDirection: 'row',
          //     alignItems: 'center',
          //     justifyContent: 'center',
          //     marginLeft: 10,
          //     marginRight: 10,
          //     height: dimensions.expand,
          //   }}>
          //     <Text style={{
          //       fontSize: 10,
          //       opacity: 0.5,
          //       color: selectedOption === displayOptions && selectedPlugin === index
          //         ? colors.active.text
          //         : colors.text,
          //     }}>•••</Text>
          //   </TouchableOpacity>
          //   : null
          // }
