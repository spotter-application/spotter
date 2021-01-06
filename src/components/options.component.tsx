import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SpotterOption } from '../core';
import { IconImageNative } from '../native';

type OptionsProps = {
  options: SpotterOption[];
  selectedIndex: number;
  executing: boolean,
  onSubmit: (option: SpotterOption) => void;
  style: ViewStyle;
}

export const Options = ({ options, selectedIndex, executing, onSubmit, style }: OptionsProps) => {

  const [ref, setRef] = useState<FlatList | null>(null);

  useEffect(() => {
    if (!ref) {
      return;
    }

    const nextSelectedIndex = selectedIndex - 1 < 0
      ? 0
      : selectedIndex - 1;

    ref.scrollToIndex({ index: nextSelectedIndex, animated: true });

  }, [selectedIndex])

  return <>
    {options.length ?
      <FlatList
        style={style}
        data={options}
        ref={setRef}
        keyExtractor={item => item.title + item.subtitle}
        persistentScrollbar={true}
        renderItem={({ item, index }: { item: SpotterOption, index: number }) => (
          <Option
            item={item}
            selected={selectedIndex === index}
            executing={executing}
            onSubmit={onSubmit}
          />
        )}
      />
    : null}
  </>
};

const Option = ({
  item,
  selected,
  executing,
  onSubmit,
}: {
  item: SpotterOption,
  selected: boolean,
  executing: boolean,
  onSubmit: (option: SpotterOption) => void,
}) => (
  <View
    key={item.title + item.subtitle}
    style={selected ? styles.activeOption : styles.option}
    onTouchEnd={() => onSubmit(item)}
  >
    {item?.image
      ? <View style={styles.imageContainer}>
        {typeof item?.image === 'string' && item?.image.endsWith('.app')
            ? <IconImageNative style={{ width: 25, height: 25 }} source={item?.image}></IconImageNative>
            : typeof item?.image === 'number'
              ? <Image style={{ width: 22, height: 22 }} source={item?.image}></Image>
              : null
        }
      </View>
      : null
    }
    <View>
      <Text>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
    {executing && selected ? <ActivityIndicator size="small" color="#ffffff" style={styles.spinner} /> : null}
  </View>
);

const styles = StyleSheet.create({
  spinner: {
    position: 'absolute',
    right: 10,
  },
  activeOption: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderBottomColor: 'transparent',
    borderBottomWidth: 1,
  },
  option: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
  },
  imageContainer: {
    marginRight: 10,
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
