import React, { FC, useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { HotkeysSettings } from './hotkeys.settings';
import { GeneralSettings } from './general.settings';
import { useSettings } from '../../providers';
import { Subscription } from 'rxjs';
import { SpotterThemeColors } from '../../interfaces';

enum Pages {
  general = 'general',
  // themes = 'themes',
  hotkeys = 'hotkeys',
  // spotify = 'spotify',
 }

export const Settings: FC<{}> = () => {

  const [activePage, setActivePage] = useState<Pages>(Pages.general);

  const onSelectPage = useCallback(setActivePage, []);

  const { colors$ } = useSettings();

  const [colors, setColors] = useState<SpotterThemeColors>();

  const subscriptions: Subscription[] = [];

  useEffect(() => {
    subscriptions.push(
      colors$.subscribe(setColors),
    );
  }, []);

  useEffect(() => {
    return () => subscriptions.forEach(s => s.unsubscribe());
  }, []);

  const renderPage = (page: Pages) => {
    switch(page) {
      case Pages.general:
        return <GeneralSettings />
      //   case Pages.themes:
      //     return <ThemesSettings />
      case Pages.hotkeys:
        return <HotkeysSettings />
      // case Pages.spotify:
      //   return <SpotifySettings />
    }
  }

  return (
    <>
      <View style={{
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: colors?.background,
      }}>
        {Object.values(Pages).map(page => (
          <TouchableOpacity
            style={{padding: 15}}
            key={page}
            onPress={() => onSelectPage(page)}
          >
            <Text
              style={{
                color: page === activePage ? colors?.hoveredOptionBackground: colors?.text,
              }}
            >{page[0].toUpperCase() + page.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{
        height: 1,
        backgroundColor: colors?.text,
        opacity: 0.2,
      }}></View>
      <ScrollView style={{
        backgroundColor: colors?.background,
      }}>
        <View style={{
          margin: 15,
        }}>
          {renderPage(activePage)}
        </View>
      </ScrollView>
    </>
  )
};
