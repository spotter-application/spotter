import React, { FC, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../providers';
import { OptionIcon, Options } from './options.component';
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
    shouldShowOptions,
  } = useEvents();

  return <>
    <SafeAreaView>
      <View style={{
        backgroundColor: colors.background,
        ...styles.input,
        ...(options?.length && shouldShowOptions ? styles.inputWithResults : {}),
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <InputNative
          style={{ flex: 1 }}
          value={query}
          placeholder='Query...'
          hint={options?.length ? options[0].title : ''}
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
          {/* {loading
            ? <ActivityIndicator size="small" color={colors.active.highlight} style={{opacity: 0.3}} />
            : null
          } */}
          {options[selectedOptionIndex] && <OptionIcon style={{}} icon={options[selectedOptionIndex].icon}></OptionIcon>}
        </View>

      </View>
      {
        shouldShowOptions && <Options
          style={{ ...styles.options, backgroundColor: colors.background }}
          selectedOptionIndex={selectedOptionIndex}
          options={options}
          onSubmit={onSubmit}
        ></Options>
      }

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
