import React, { FC } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../providers';
import { Options } from './options.component';
import { InputNative } from '../core/native';
import { useEvents } from '../providers/events.provider';

export const QueryPanel: FC<{}> = () => {

  const { colors } = useTheme();

  const {
    onQuery,
    onSubmit,
    onArrowUp,
    onArrowDown,
    onEscape,
    onCommandComma,
    onTab,
    onBackspace,
    options,
    loading,
    query,
    selectedOptionIndex,
  } = useEvents();

  return <>
    <SafeAreaView>
      <View style={{
        backgroundColor: colors.background,
        ...styles.input,
        ...(options?.length ? styles.inputWithResults : {}),
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <InputNative
          style={{ flex: 1 }}
          value={query}
          placeholder='Query...'
          hint={''}
          onChangeText={onQuery}
          onSubmit={onSubmit}
          onArrowDown={onArrowDown}
          onArrowUp={onArrowUp}
          onEscape={onEscape}
          onCommandComma={onCommandComma}
          onTab={onTab}
          onBackspace={onBackspace}
        ></InputNative>

        <View style={{marginLeft: 10}}>
          {loading
            ? <ActivityIndicator size="small" color={colors.active.highlight} />
            : null
          }
        </View>

      </View>
      <Options
        style={{ ...styles.options, backgroundColor: colors.background }}
        selectedOptionIndex={selectedOptionIndex}
        options={options}
        onSubmit={onSubmit}
      ></Options>
    </SafeAreaView>
  </>
}

const styles = StyleSheet.create({
  inputWithResults: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  input: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 10,
  },
  options: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    paddingTop: 10,
    paddingBottom: 10,
    height: 510,
  },
});
