import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SpotterOption } from '@spotter-app/core';

import Panel from './core/native/panel.native';
import PluginsRegistry from './core/plugins.registry';
import Api from './core/native/api.native';
import Spotify from './plugins/spotify.plugin';
import Applications from './plugins/applications.plugin';
import Calculator from './plugins/calculator.plugin';
import Storage from './core/native/storage.native';
import GlobalHotkey from './core/native/hotkey.native';
import { Search } from './core/components/search.component';
import { Options } from './core/components/options.component';

export const App = () => {

  const hotKey = new GlobalHotkey();
  const panel = new Panel();
  const pluginsRegistry = new PluginsRegistry();
  const api = new Api();
  const storage = new Storage();

  const [query, setQuery] = useState<string>('');
  const [options, setOptions] = useState<SpotterOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onChangeText = (query: string) => {
    const possibleOptions = pluginsRegistry.list.reduce<SpotterOption[]>((acc, plugin) => (
      [...acc, ...plugin.query(query)]
    ), []);

    setSelectedIndex(0);
    setOptions(possibleOptions);
    setQuery(query);
  }

  const onSubmitEditing = () => {
    if (!options[selectedIndex]) {
      return;
    }

    execAction(options[selectedIndex]);
  }

  const execAction = (option: any) => {
    if (!option?.action) {
      return;
    }

    option.action();
    panel.close();
    resetOptions();
  }

  const resetOptions = () => {
    setSelectedIndex(0);
    setQuery('');
    setOptions([]);
  }

  useEffect(() => {
    pluginsRegistry.register([
      new Spotify(api),
      new Applications(api, storage),
      new Calculator(),
    ]);

    hotKey.register('', ''); // TODO: do

    hotKey.onPress(() => {
      console.log('OPEN!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
      panel.open();
    });
    panel.onEsc(() => {
      panel.close();
      resetOptions();
    });

    panel.onUpArrow(() => {
      const nextSelectedIndex = selectedIndex - 1;
      if (!options[nextSelectedIndex]) {
        return;
      }

      setSelectedIndex(nextSelectedIndex)
    });

    panel.onDownArrow(() => {
      const nextSelectedIndex = selectedIndex + 1;
      if (!options[nextSelectedIndex]) {
        return;
      }

      setSelectedIndex(nextSelectedIndex)
    });
  })

  const test = () => {
    console.log("TEST!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  }

  return <>
    <SafeAreaView>
      <Search value={query} placeholder="Query..." onSubmit={onSubmitEditing} onChange={onChangeText}></Search>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.options}>
        <Options selectedIndex={selectedIndex} options={options} onSubmit={execAction}></Options>
      </ScrollView>
    </SafeAreaView>
  </>
}

const styles = StyleSheet.create({
  options: {
    backgroundColor: '#000',
  }
});
