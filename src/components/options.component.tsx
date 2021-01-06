import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, LayoutChangeEvent, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SpotterOption, SpotterOptionWithId } from '../core';
import { IconImageNative } from '../native';

type OptionsProps = {
  options: SpotterOptionWithId[];
  selectedIndex: number;
  onSubmit: (option: SpotterOption) => void;
  style: ViewStyle;
}

export const Options = ({ options, selectedIndex, onSubmit, style }: OptionsProps) => {

  const [ref, setRef] = useState<FlatList | null>(null);
  const [dataSourceCords, setDataSourceCords] = useState<number[]>([]);

  useEffect(() => {
    if (!ref) {
      return;
    }

    const nextSelectedIndex = selectedIndex - 1 < 0
      ? 0
      : selectedIndex - 1;
    ref.scrollToIndex({ index: nextSelectedIndex, animated: true })


    ref.flashScrollIndicators()

    // ref.scrollTo({
    //   y: dataSourceCords[selectedIndex - 2],
    // });

  }, [dataSourceCords, selectedIndex])

  const onLayout = useCallback((event: LayoutChangeEvent, index: number) => {
    const layout = event.nativeEvent.layout;
    dataSourceCords[index] = layout.y;
    setDataSourceCords(dataSourceCords);
  }, [dataSourceCords])

  return <>
    {options.length ?
      <FlatList
        style={style}
        data={options}
        ref={setRef}
        keyExtractor={item => item.id}
        persistentScrollbar={true}
        renderItem={({ item, index }) => (
          <View
            key={item.id}
            style={selectedIndex === index ? styles.activeOption : styles.option}
            onTouchEnd={() => onSubmit(item)}
            onLayout={(e) => onLayout(e, index)}
          >
            <View>
              <Text>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
            <View>
              {(item.image && item.image.endsWith('.app'))
                ? <IconImageNative source={item.image}></IconImageNative>
                : null
              }
            </View>
          </View>
      )} />
    : null}
  </>
};

const styles = StyleSheet.create({
  activeOption: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderBottomColor: 'transparent',
    borderBottomWidth: 1,
  },
  option: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: 5
  }
});
