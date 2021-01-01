import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SpotterOption, SpotterOptionWithId } from '../shared';

type OptionsProps = {
  options: SpotterOptionWithId[];
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
        key={option.id}
        style={selectedIndex === index ? styles.activeOption : styles.option}
        onTouchEnd={() => onSubmit(option)}
        onLayout={(e) => onLayout(e, index)}
      >
        <Text>{option.title}</Text>
        <Text style={styles.subtitle}>{option.subtitle}</Text>
      </View>
    ))}
  </ScrollView>
};

const styles = StyleSheet.create({
  activeOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderBottomColor: 'transparent',
    borderBottomWidth: 1,
  },
  option: {
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
