import { SpotterOption } from '@spotter-app/core';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type OptionsProps = {
  options: SpotterOption[];
  selectedIndex: number;
  onSubmit: (option: SpotterOption) => void;
}

export const Options = ({ options, selectedIndex, onSubmit }: OptionsProps) => (
  <>
    {options.map((option, index) => (
      <View
        key={option.title}
        style={selectedIndex === index ? styles.activeOption : styles.option}
        onTouchEnd={() => onSubmit(option)}
      >
        <Text>{option.title}</Text>
      </View>
    ))}
  </>
);

const styles = StyleSheet.create({
  activeOption: {
    backgroundColor: 'grey',
    padding: 10,
  },
  option: {
    padding: 10,
  },
});
