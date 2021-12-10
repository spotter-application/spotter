import React, { FC, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSpotterState, useTheme } from '../../providers';
import { OptionIcon, QueryPanelOptions } from './options.queryPanel';
import { Input } from '../../native';
import { useEvents } from '../../providers/events.provider';
import { getHint } from '../../helpers';
import { PluginOption } from '../../interfaces';
import { Subscription } from 'rxjs';

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
    options$,
    placeholder$,
    loading$,
    query$,
    hoveredOptionIndex$,
    selectedOption$,
    waitingFor$,
    displayedOptionsForCurrentWorkflow$,
  } = useSpotterState();

  const [options, setOptions] = useState<PluginOption[]>([]);
  const [placeholder, setPlaceholder] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [hoveredOptionIndex, setHoveredOptionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<PluginOption | null>(null);
  const [waitingFor, setWaitingFor] = useState<string | null>(null);
  const [
    displayedOptionsForCurrentWorkflow,
    setDisplayedOptionsForCurrentWorkflow,
  ] = useState<boolean>(false);

  const subscriptions: Subscription[] = [];

  useEffect(() => {
    subscriptions.push(
      options$.subscribe(setOptions),
      placeholder$.subscribe(setPlaceholder),
      loading$.subscribe(setLoading),
      query$.subscribe(setQuery),
      hoveredOptionIndex$.subscribe(setHoveredOptionIndex),
      selectedOption$.subscribe(setSelectedOption),
      waitingFor$.subscribe(setWaitingFor),
      displayedOptionsForCurrentWorkflow$.subscribe(setDisplayedOptionsForCurrentWorkflow),
    );
  }, []);

  useEffect(() => {
    return () => subscriptions.forEach(s => s.unsubscribe());
  }, []);

  const displayOptions = !!options.length || displayedOptionsForCurrentWorkflow;

  return <>
    <SafeAreaView>
      <View style={{
        backgroundColor: colors.background,
        ...styles.input,
        ...(displayOptions || waitingFor ? styles.inputWithResults : {}),
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
              backgroundColor: colors.activeOptionBackground,
              paddingLeft: 10,
              paddingRight: 10,
              borderRadius: 10,
              marginRight: 5,
              padding: 5,
            }}>
              <OptionIcon style={{ paddingRight: 3 }} icon={selectedOption.icon}></OptionIcon>
              <Text style={{ fontSize: 16, color: colors.activeOptionText }}>{selectedOption.title}</Text>
            </View>
          : null
        }
        <Input
          style={{
            color: colors.text,
          }}
          value={query}
          placeholder={placeholder ?? 'Query...'}
          hint={getHint(query, options[hoveredOptionIndex])}
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
            ? <ActivityIndicator size="small" color={colors.activeOptionBackground} style={{
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
          displayOptions={displayOptions}
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
