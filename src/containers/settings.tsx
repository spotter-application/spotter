import React, { FC, useCallback, useEffect, useState } from 'react';
import {Button, ScrollView, Text, TextInput, View} from 'react-native';
import { HotkeyInput } from '../native/hotkey-input.native';
import {
  SpotterHotkey,
  SpotterPluginHotkeys,
  SpotterSettings,
  SPOTTER_HOTKEY_IDENTIFIER,
  SpotterWebsiteShortcut
} from '../core';
import { OptionIcon, useApi, useTheme } from '../components';
import spotterIcon from './icon.png';

const WEBSTORAGE = 'WEBSHORTCUTS';

export const SettingsHotkey: FC<{
  hotkey?: SpotterHotkey | null,
  onPressHotkey: (hotkey: SpotterHotkey) => void,
}> = ({
  hotkey,
  onPressHotkey,
}) => {
  const { colors } = useTheme();

  return <>
    <View style={{ display: 'flex', flexDirection: 'row', alignItems: "center", marginBottom: 10 }}>
      <OptionIcon icon={spotterIcon} style={{}}/>
      <Text style={{ fontSize: 20, marginLeft: 5 }}>
        Spotter
      </Text>
    </View>
    <View style={{ marginLeft: 0, marginBottom: 15 }}>
      <Text style={{ fontSize: 16, marginLeft: 3 }}>Open</Text>
      <View style={{ flex: 1, backgroundColor: colors.background, marginTop: 5, borderRadius: 15 }}>
        <HotkeyInput
          styles={{ padding: 20, backgroundColor: 'transparent' }}
          hotkey={hotkey}
          onPressHotkey={onPressHotkey}
        ></HotkeyInput>
      </View>
    </View>
  </>
}

export const Settings: FC<{}> = () => {

  const { api, registries } = useApi();
  const [spotterSettings, setSpotterSettings] = useState<SpotterSettings | null>(null);

  const onPressHotkey = useCallback(async (hotkey: SpotterHotkey, plugin?: string, option?: string) => {
    const nextHotkey = hotkey.keyCode === null ? null : hotkey;
    if (!plugin) {
      await registries.settings.patchSettings({ hotkey: nextHotkey });
      api.globalHotKey.register(nextHotkey, SPOTTER_HOTKEY_IDENTIFIER);
      api.globalHotKey.onPress((e) => {
        if (e.identifier !== SPOTTER_HOTKEY_IDENTIFIER) {
          return;
        }

        api.panel.open();
      });
      return;
    }

    if (!option) {
      return;
    }

    const pluginHotkeys: SpotterPluginHotkeys = {
      ...spotterSettings?.pluginHotkeys,
      [plugin]: {
        ...(spotterSettings?.pluginHotkeys[plugin]
          ? spotterSettings.pluginHotkeys[plugin]
          : {}
        ),
        [option]: nextHotkey,
      },
    };

    await registries.settings.patchSettings({ pluginHotkeys });

    api.globalHotKey.register(nextHotkey, `${plugin}#${option}`);
    api.globalHotKey.onPress(async (e) => {
      if (e.identifier === SPOTTER_HOTKEY_IDENTIFIER) {
        return;
      }

      const [plugin, option] = e.identifier.split('#');
      // const options = registries.plugins.options[plugin];
      // if (options?.length) {
      //   await options.find(o => o.title === option)?.action();
      // }
    });

  }, []);

  return (
    <ScrollView>
      <View style={{ margin: 15 }}>
        <Text style={{ fontSize: 28 }}>Hotkeys</Text>
        <SettingsHotkey hotkey={spotterSettings?.hotkey} onPressHotkey={onPressHotkey}/>
        <SettingsWebsiteShortcuts setSpotterSettings={setSpotterSettings}/>
      </View>
    </ScrollView>
  )
};

        // { Object.keys(registries.plugins.options).map((plugin: string) => (
        //   <View style={{ marginTop: 25 }} key={plugin}>
        //     <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        //       <OptionIcon icon={registries.plugins.options[plugin][0]?.icon} />
        //       <Text style={{ fontSize: 20, marginLeft: -5 }}>
        //         {plugin.replace('Plugin', '').replace(/([A-Z])/g, ' $1')}
        //       </Text>
        //     </View>
        //     { registries.plugins.options[plugin].map(option => (
        //       <View style={{ marginLeft: 0, marginBottom: 15 }} key={plugin + option.title}>
        //         <Text style={{ fontSize: 16, marginLeft: 3 }}>{option.title}</Text>
        //         <View style={{ flex: 1, backgroundColor: colors.background, marginTop: 5, borderRadius: 15 }}>
        //           <HotkeyInput
        //             styles={{ padding: 20, backgroundColor: 'transparent' }}
        //             hotkey={spotterSettings?.pluginHotkeys && spotterSettings?.pluginHotkeys[plugin] ? spotterSettings?.pluginHotkeys[plugin][option.title] : null}
        //             onPressHotkey={hotkey => onPressHotkey(hotkey, plugin, option.title)}
        //           ></HotkeyInput>
        //         </View>
        //       </View>
        //     )) }
        //   </View>
        // )) }

// TODO: Move to the Shortcuts plugin
const SettingsWebsiteShortcuts: FC<{
  setSpotterSettings: (settings: SpotterSettings) => void
}> = ({
  setSpotterSettings,
}) => {
  const { colors } = useTheme();
  const [webShortcutList, setWebShortcutList] = useState<SpotterWebsiteShortcut[] | null>(null);
  const { api, registries } = useApi();

  useEffect(() => {
    const setSettings = async () => {
      const settings = await registries.settings.getSettings()
      const webShortcuts = await api.storage.getItem<SpotterWebsiteShortcut[]>(WEBSTORAGE);
      setWebShortcutList(webShortcuts);
      setSpotterSettings(settings);
    };

    setSettings();
  }, []);

  return <>
    <View style={{ marginTop: 25 }}>
      <View style={{ marginLeft: 0, marginBottom: 15 }}>
        <Text style={{ fontSize: 16, marginLeft: 3 }}>Website Shortcuts</Text>
        {webShortcutList && webShortcutList.map((_, i)=> (
          <View key={i} style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
            <TextInput
              placeholder={'Your shortcut'}
              defaultValue={webShortcutList[i].shortcut}
              style={{
                paddingTop:12,
                textAlign: 'center',
                width: 100,
                height: 50,
                backgroundColor: colors.background,
                marginRight:10,
                marginTop: 5,
                borderRadius: 15
              }}
              onChangeText={(e)=>{
                webShortcutList[i] = {shortcut: e, url: webShortcutList[i].url};
                api.storage.setItem(WEBSTORAGE, webShortcutList);
              }}
            />
            <TextInput
              placeholder={'Website URL'}
              defaultValue={webShortcutList[i].url}
              style={{
                paddingTop:12,
                textAlign: 'center',
                flex: 1,
                height: 50,
                backgroundColor: colors.background,
                marginTop: 5,
                borderRadius: 15,
              }}
              onChangeText={(e)=>{
                webShortcutList[i] = {url: e, shortcut: webShortcutList[i].shortcut}
                api.storage.setItem(WEBSTORAGE, webShortcutList);
              }}
            />
            <Button title={"X"} color={"red"} onPress={() => {
              const oldShortcuts: SpotterWebsiteShortcut[] = [...webShortcutList];
              oldShortcuts.splice(i, 1);
              setWebShortcutList(oldShortcuts)
              api.storage.setItem(WEBSTORAGE, oldShortcuts);
            }}/>
          </View>
        ))}
        <Button title={'Add more'} onPress={()=>{
          const oldShortcuts : SpotterWebsiteShortcut[] = webShortcutList ? [...webShortcutList] : [];
          oldShortcuts.push({shortcut: '', url: ''});
          setWebShortcutList(oldShortcuts)
          api.storage.setItem(WEBSTORAGE, oldShortcuts);
        }}/>
      </View>
    </View>
  </>
}
