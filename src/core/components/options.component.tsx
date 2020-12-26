import { SpotterOption } from '@spotter-app/core';
import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

type OptionsProps = {
  options: SpotterOption[];
  selectedIndex: number;
  onSubmit: (option: SpotterOption) => void;
  style: StyleProp<ViewStyle>;
}

export const Options = ({ options, selectedIndex, onSubmit, style }: OptionsProps) => {

  const [ref, setRef] = useState<ScrollView | null>(null);
  const [dataSourceCords, setDataSourceCords] = useState<number[]>([]);

  useEffect(() => {
    if (!ref) {
      return;
    }

    ref.scrollTo({
      y: dataSourceCords[selectedIndex - 2],
    });

  }, [dataSourceCords, selectedIndex])

  const onLayout = useCallback((event: LayoutChangeEvent, index: number) => {
    const layout = event.nativeEvent.layout;
    dataSourceCords[index] = layout.y;
    setDataSourceCords(dataSourceCords);
  }, [dataSourceCords])

  return <ScrollView contentInsetAdjustmentBehavior="automatic" style={style} ref={setRef}>
    {options.map((option, index) => (
      <View
        key={option.title}
        style={selectedIndex === index ? styles.activeOption : styles.option}
        onTouchEnd={() => onSubmit(option)}
        onLayout={(e) => onLayout(e, index)}
      >
        <Text>{option.title}</Text>
      </View>
    ))}
  </ScrollView>
};

const styles = StyleSheet.create({
  activeOption: {
    backgroundColor: 'grey',
    padding: 10,
  },
  option: {
    padding: 10,
  },
});
