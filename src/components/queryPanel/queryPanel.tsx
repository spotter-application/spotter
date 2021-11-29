import React, { FC } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSpotterState, useTheme } from '../../providers';
import { OptionIcon, QueryPanelOptions } from './options.queryPanel';
import { Input } from '../../core/native';
import { useEvents } from '../../providers/events.provider';

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
  } = useEvents();

  const {
    options,
    hint,
    loading,
    query,
    hoveredOptionIndex,
    selectedOption,
    waitingFor,
  } = useSpotterState();

  return <>
    <SafeAreaView>
      <View style={{
        backgroundColor: colors.background,
        ...styles.input,
        ...(options?.length || waitingFor ? styles.inputWithResults : {}),
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        {
          selectedOption ?
          // TODO: Create component
            <View style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.active.highlight,
              paddingLeft: 10,
              paddingRight: 10,
              borderRadius: 10,
              marginRight: 5,
              padding: 5,
            }}>
              <OptionIcon style={{ paddingRight: 3 }} icon={selectedOption.icon}></OptionIcon>
              <Text style={{ fontSize: 16 }}>{selectedOption.title}</Text>
            </View>
          : null
        }
        <Input
          style={{ flex: 1 }}
          value={query}
          placeholder={hint ?? 'Query...'}
          hint={query?.length && options?.length ? options[0].title : ''}
          onChangeText={onQuery}
          onSubmit={onSubmit}
          onArrowDown={onArrowDown}
          onArrowUp={onArrowUp}
          onEscape={onEscape}
          onCommandComma={onCommandComma}
          onTab={onTab}
          onBackspace={onBackspace}
        ></Input>

        <View style={{marginLeft: 10}}>
          {loading
            ? <ActivityIndicator size="small" color={colors.active.highlight} style={{
              opacity: 0.3,
              right: 3,
              bottom: 0,
              top: 0,
              margin: 'auto',
              position: 'absolute',
              zIndex: 100,
            }} />
            : null
          }
          {options[hoveredOptionIndex] && <OptionIcon style={{}} icon={options[hoveredOptionIndex].icon}></OptionIcon>}
        </View>

      </View>
      { waitingFor?.length ?
        <View style={{
          backgroundColor: colors.background,
          ...styles.input,
          padding: 10,
          paddingTop: 0,
          ...(options?.length ? styles.inputWithResults : {}),
        }}>
          <Text style={{ opacity: 0.5, fontSize: 12 }}>{waitingFor}</Text>
        </View> : null
      }
      {
        <QueryPanelOptions
          style={{ ...styles.options, backgroundColor: colors.background }}
          hoveredOptionIndex={hoveredOptionIndex}
          options={options}
          onSubmit={onSubmit}
        ></QueryPanelOptions>
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
