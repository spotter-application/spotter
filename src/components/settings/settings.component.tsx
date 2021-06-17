import React, { FC, useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View} from 'react-native';
import { useTheme } from '../../providers';
import { HotkeysSettings } from './hotkeys-settings.component';
import { GeneralSettings } from './general-settings.component';
import { ThemesSettings } from './themes-settings.component';

enum Pages {
  themes = 'themes',
  general = 'general',
  hotkeys = 'hotkeys'
}

export const Settings: FC<{}> = () => {

  const { colors } = useTheme();
  const [activePage, setActivePage] = useState<Pages>(Pages.general);

  const onSelectPage = useCallback(setActivePage, []);

  const renderPage = (page: Pages) => {
    switch(page) {
      case Pages.general:
        return <GeneralSettings />
        case Pages.themes:
          return <ThemesSettings />
      case Pages.hotkeys:
        return <HotkeysSettings />
    }
  }

  return (
    <>
      <View style={{
        display: 'flex',
        flexDirection: 'row',
        borderBottomColor: colors.highlight,
        borderBottomWidth: 1,
      }}>
        {Object.values(Pages).map(page => (
          <TouchableOpacity
            style={{padding: 15}}
            key={page}
            onPress={() => onSelectPage(page)}
          >
            <Text
              style={{
                color: page === activePage ? colors.text : colors.description,
              }}
            >{page[0].toUpperCase() + page.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView>
        <View style={{margin: 15}}>
          {renderPage(activePage)}
        </View>
      </ScrollView>
    </>
  )
};
