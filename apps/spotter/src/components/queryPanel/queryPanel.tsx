import React, { FC, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSettings, useSpotterState } from '../../providers';
import { OptionIcon, QueryPanelOptions } from './options.queryPanel';
import { Input } from '../../native';
import { useEvents } from '../../providers/events.provider';
import { getHint } from '../../helpers';
import { PluginOnQueryOption, PluginRegistryOption, SpotterThemeColors } from '../../interfaces';
import { Subscription } from 'rxjs';

export const QueryPanel: FC<{}> = () => {

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
    displayedOptionsForCurrentWorkflow$,
    doing$,
  } = useSpotterState();

  const { colors$ } = useSettings();

  const [options, setOptions] = useState<PluginOnQueryOption[] | PluginRegistryOption[]>([]);
  const [placeholder, setPlaceholder] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [doing, setDoing] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [hoveredOptionIndex, setHoveredOptionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<PluginOnQueryOption | PluginRegistryOption | null>(null);
  const [
    displayedOptionsForCurrentWorkflow,
    setDisplayedOptionsForCurrentWorkflow,
  ] = useState<boolean>(false);
  const [colors, setColors] = useState<SpotterThemeColors>();

  const subscriptions: Subscription[] = [];

  useEffect(() => {
    subscriptions.push(
      options$.subscribe(setOptions),
      placeholder$.subscribe(setPlaceholder),
      loading$.subscribe(setLoading),
      doing$.subscribe(setDoing),
      query$.subscribe(setQuery),
      hoveredOptionIndex$.subscribe(setHoveredOptionIndex),
      selectedOption$.subscribe(setSelectedOption),
      displayedOptionsForCurrentWorkflow$.subscribe(setDisplayedOptionsForCurrentWorkflow),
      colors$.subscribe(setColors),
    );
  }, []);

  useEffect(() => {
    return () => subscriptions.forEach(s => s.unsubscribe());
  }, []);

  const displayOptions = !!options.length || displayedOptionsForCurrentWorkflow;
  return <>
    <SafeAreaView>
      <View style={{
        backgroundColor: colors?.background,
        ...styles.input,
        ...(displayOptions || doing ? styles.inputWithResults : {}),
      }}>
        {
          selectedOption ?
          // TODO: Create component
            <View style={{
              ...styles.selectedOptionContainer,
              backgroundColor: colors?.activeOptionBackground,
            }}>
              <OptionIcon
                style={{
                  paddingRight: 3,
                  height: 25,
                }}
                icon={selectedOption.icon}
              ></OptionIcon>
              <Text style={{
                fontSize: 16,
                color: colors?.activeOptionText
              }}>{selectedOption.title}</Text>
            </View>
          : null
        }
        <Input
          style={{ color: colors?.text }}
          value={query}
          placeholder={
            placeholder?.length
              ? placeholder
              : selectedOption ? `${selectedOption.title} search...` : 'Spotter search...'
          }
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
            ? <ActivityIndicator
                size="small"
                color={colors?.text}
                style={{
                  opacity: 0.75,
                  right: 3,
                  bottom: 0,
                  top: 0,
                  margin: 'auto',
                  position: 'absolute',
                  zIndex: 100,
                }}
              />
            : null
          }
          {
            (options[hoveredOptionIndex] && !loading) &&
            <OptionIcon style={{
              opacity: loading ? 0.1 : 1,
            }} icon={options[hoveredOptionIndex].icon}></OptionIcon>
          }
        </View>

      </View>
      {doing &&
        <View style={{
          backgroundColor: colors?.background,
          paddingLeft: 14,
          paddingBottom: 10,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          ...(displayOptions ? styles.inputWithResults : {}),
        }}>
          <Text style={{
            fontSize: 12,
          }}>{doing}</Text>
        </View>
      }
      {
        <QueryPanelOptions
          style={{ ...styles.options, backgroundColor: colors?.background }}
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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  options: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    paddingTop: 10,
    paddingBottom: 10,
    height: 510,
  },
  selectedOptionContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 10,
    marginRight: 5,
    padding: 5,
  }
});
