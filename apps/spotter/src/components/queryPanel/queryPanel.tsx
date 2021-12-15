import React, { FC, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSettings, useSpotterState } from '../../providers';
import { OptionIcon, QueryPanelOptions } from './options.queryPanel';
import { Input } from '../../native';
import { useEvents } from '../../providers/events.provider';
import { getHint } from '../../helpers';
import { PluginOnQueryOption, PluginRegistryOption, SpotterThemeColors } from '../../interfaces';
import { Subscription } from 'rxjs';
import { Option } from '@spotter-app/core';

export const QueryPanel: FC<{}> = () => {

  const {
    onQuery,
    onSubmit,
    onArrowUp,
    onArrowDown,
    onEscape,
    onCommandKey,
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
    systemOption$,
    doing$,
  } = useSpotterState();

  const { colors$ } = useSettings();

  const [options, setOptions] = useState<PluginOnQueryOption[] | PluginRegistryOption[]>([]);
  const [placeholder, setPlaceholder] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean | string>(false);
  const [doing, setDoing] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [hoveredOptionIndex, setHoveredOptionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<PluginOnQueryOption | PluginRegistryOption | null>(null);
  const [
    displayedOptionsForCurrentWorkflow,
    setDisplayedOptionsForCurrentWorkflow,
  ] = useState<boolean>(false);
  const [colors, setColors] = useState<SpotterThemeColors>();
  const [systemOption, setSystemOption] = useState<Option | null>();

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
      systemOption$.subscribe(setSystemOption),
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
        ...(displayOptions ? styles.inputWithResults : {}),
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
          onCommandKey={onCommandKey}
          onTab={onTab}
          onBackspace={onBackspace}
        ></Input>

        <View style={{
          display: 'flex',
          marginLeft: 10,
        }}>
          {(loading || doing) &&
            <View style={{
              opacity: 0.75,
            }}>
              {doing &&
                <Text style={{
                  fontSize: 14,
                  color: colors?.text,
                  paddingRight: 30,
                }}>{doing}</Text>
              }
              <ActivityIndicator
                size="small"
                color={colors?.text}
                style={{
                  position: 'absolute',
                  right: 3,
                  top: -1,
                  zIndex: 100,
                }}
              />
            </View>
          }
          {
            (options[hoveredOptionIndex] && !loading && !systemOption && !doing) &&
            <OptionIcon style={{
              opacity: loading ? 0.1 : 1,
            }} icon={options[hoveredOptionIndex].icon}></OptionIcon>
          }
          {
            (!loading && systemOption) &&
            <TouchableOpacity style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 10,
              backgroundColor: colors?.hoveredOptionBackground,
            }} onPress={systemOption.onSubmit}>
              <Text style={{
                fontSize: 12,
              }}>{systemOption.title}</Text>
              <View style={{
                marginTop: 2,
                margin: 'auto',
                alignItems: 'flex-end',
              }}>
                <Text style={{
                  fontSize: 9,
                  opacity: 0.5,
                }}>{systemOption.subtitle}</Text>
              </View>

              <View style={{
                position: 'absolute',
                left: 4,
                bottom: 3.2,
                backgroundColor: colors?.background,
                opacity: 0.3,
                padding: 1,
                paddingLeft: 4,
                paddingRight: 4,
                borderRadius: 5,
              }}>
                <Text style={{
                  fontSize: 8,
                  color: colors?.text,
                }}>cmd + u</Text>
              </View>
            </TouchableOpacity>
          }
        </View>

      </View>
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
