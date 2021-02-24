import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, View, ViewStyle } from 'react-native';
import { SpotterOptionWithPluginIdentifierMap, SpotterOption, SpotterOptionBaseImage } from '../core';
import { IconImageNative } from '../native';
import { useTheme } from './theme.provider';

type OptionsProps = {
  options: SpotterOptionWithPluginIdentifierMap;
  selectedPlugin: number;
  selectedOption: number;
  executingOption: boolean,
  expandedPlugins: number[],
  onSubmit: (option: SpotterOption) => void;
  displayOptions: number,
  style: ViewStyle;
}

const dimensions = {
  option: 40,
  expand: 20,
  pluginTitle: 20,
  pluginMarginTop: 15,
};

export const Options = ({
  options,
  selectedPlugin,
  selectedOption,
  executingOption,
  expandedPlugins,
  onSubmit,
  displayOptions,
  style,
}: OptionsProps) => {

  const [ref, setRef] = useState<FlatList | null>(null);

  const { colors } = useTheme();

  useEffect(() => {
    if (!ref || !Object.values(options).length) {
      return;
    }

    const optionsAbove = getOptionsAbove(
      selectedPlugin,
      selectedOption,
      expandedPlugins,
      options,
      displayOptions,
    );

    const unexpandedPluginsAbove = [...Array(selectedPlugin).keys()].reduce((acc, pluginIndex) => {
      const expanded = expandedPlugins.filter(p => p === pluginIndex).length;
      return expanded ? acc : acc + 1;
    }, 0);

    const offset = (
      (optionsAbove * dimensions.option) +
      (unexpandedPluginsAbove * dimensions.expand) +
      (selectedPlugin * dimensions.pluginTitle) +
      (selectedPlugin * dimensions.pluginMarginTop)
    );

    if (offset === 0) {
      ref.scrollToOffset({ offset: offset })
    }

    if (offset > 200) {
      ref.scrollToOffset({ offset: offset - 200 })
    }

  }, [selectedPlugin, selectedOption])

  const getOptionsAbove = (
    selectedPlugin: number,
    selectedOption: number,
    expandedPlugins: number[],
    options: SpotterOptionWithPluginIdentifierMap,
    displayOptions: number,
  ) => {
    return Object.values(options).reduce((acc, opts, index) => {
      if (!opts || index > selectedPlugin) {
        return acc;
      }

      if (index === selectedPlugin) {
        return acc + selectedOption;
      }

      const pluginExpanded = expandedPlugins.filter(p => p === index).length;
      return acc + (pluginExpanded
        ? opts.length
        : (opts.length < displayOptions ? opts.length : displayOptions)
      );
    }, 0);
  }

  return <FlatList
     style={style}
     data={Object.entries(options)}
     ref={setRef}
     keyExtractor={(item, i) => item[0] + i}
     persistentScrollbar={true}
     renderItem={({ item, index }) => (
       <View
        key={item[0]}
       >
        {(item[1] === 'loading' || item[1]?.length) ?
         <View key={item[0]} style={{ paddingLeft: 10, paddingRight: 10 }}>
           <View style={{
             height: dimensions.pluginTitle,
             marginTop: index ? dimensions.pluginMarginTop : 0,
             display: 'flex',
             alignItems: 'center',
             flexDirection: 'row',
           }}>
              <Text style={{ fontSize: 11, paddingLeft: 10, paddingBottom: 5, opacity: 0.3 }}>{item[0]}</Text>
           </View>
          {item[1] === 'loading'
            // ? <ActivityIndicator size="small" color="#ffffff" />
            ? null
            : item[1]?.map((option: SpotterOption, optionIndex: number) => (
                optionIndex < (expandedPlugins.filter(p => p === index).length ? 1000 : displayOptions) ?
                  <View
                    key={item[0] + option.title}
                    style={{
                      height: dimensions.option,
                      paddingLeft: 10,
                      paddingRight: 10,
                      backgroundColor: (index === selectedPlugin && optionIndex === selectedOption) ? colors.active.background : 'transparent', borderRadius: 10,
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <OptionIcon icon={option?.icon} style={{ marginRight: 5 }}/>
                      <Text
                        style={{
                          fontSize: 13,
                          color: (index === selectedPlugin && optionIndex === selectedOption) ? colors.active.text : colors.text,
                          borderRadius: 10,
                        }}
                      >{option.title}</Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: (index === selectedPlugin && optionIndex === selectedOption) ? colors.active.text : colors.text,
                          opacity: 0.3,
                          marginLeft: 'auto'
                        }}
                      >{option.subtitle}</Text>
                  </View>
                  : null
              ))
          }
        </View> : null}
          {item[1] !== 'loading' && item[1]?.length > displayOptions && !expandedPlugins.filter(e => e === index).length
            ? <View style={{
              backgroundColor: selectedOption === displayOptions && selectedPlugin === index ? colors.active.background : colors.active.border,
              borderRadius: 10,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 10,
              marginRight: 10,
              height: dimensions.expand,
            }}>
              <Text style={{
                fontSize: 10,
                opacity: 0.5,
                color: selectedOption === displayOptions && selectedPlugin === index ? colors.active.text : colors.text,
              }}>•••</Text>
            </View>
            : null
          }
      </View>
     )}
  />
};

export const OptionIcon = ({ style, icon }: { style: ViewStyle, icon: SpotterOptionBaseImage }) => {
  return <>
    {icon
      ? <View style={style}>
        {typeof icon === 'string' && (icon.endsWith('.app') || icon.endsWith('.prefPane'))
          ? <IconImageNative style={{ width: 25, height: 25 }} source={icon}></IconImageNative>
          : typeof icon === 'number' || (typeof icon === 'object' && icon.uri)
            ? <Image style={{ width: 22, height: 22 }} source={icon}></Image>
            : <Text>{icon}</Text>
        }
      </View>
      : null
  }
  </>
};

