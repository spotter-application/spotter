import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, LayoutChangeEvent, StyleSheet, Text, View, ViewStyle } from 'react-native';
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

    ref.scrollToIndex({ index: nextSelectedIndex, animated: true });

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
        renderItem={({ item, index }: { item: SpotterOptionWithId, index: number }) => (
          <Option item={item} selected={selectedIndex === index} onSubmit={onSubmit}/>
        )}
      />
    : null}
  </>
};

const Option = ({ item, selected, onSubmit }: { item: SpotterOptionWithId, selected: boolean, onSubmit: (option: SpotterOption) => void }) => (
  <View
    key={item.id}
    style={selected ? styles.activeOption : styles.option}
    onTouchEnd={() => onSubmit(item)}
  >
    <View>
      <Text>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
    <View>
      {item?.image
        ? typeof item?.image === 'string' && item?.image.endsWith('.app')
          ? <IconImageNative style={{ width: 25, height: 25 }} source={item?.image}></IconImageNative>
          : typeof item?.image === 'number'
            ? <Image style={{ width: 22, height: 22 }} source={item?.image}></Image>
            : null
        : null
      }
    </View>
  </View>
);

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
