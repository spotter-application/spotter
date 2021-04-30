import React, { FC, useCallback, useEffect, useState } from 'react';
import {Button, ScrollView, Text, TextInput, View} from 'react-native';
import { HotkeyInput } from '../core/native/hotkey-input.native';
import {
  SpotterHotkey,
  SpotterPluginHotkeys,
  SpotterSettings,
  SPOTTER_HOTKEY_IDENTIFIER,
  SpotterWebsiteShortcut,
} from '../core';
import { useApi, useTheme } from '../providers';

interface SpotterOptionShortcut {
  title: string,
  hotkey?: SpotterHotkey | null,
}

const WEBSTORAGE = 'WEBSHORTCUTS';

const SettingsPluginShortcut: FC<{
  shortcut: SpotterOptionShortcut,
  onSaveHotkey: (hotkey: SpotterHotkey) => Promise<void>,
}> = ({
  shortcut,
  onSaveHotkey,
}) => {
  const { colors } = useTheme();

  return <>
    <Text style={{
      fontSize: 16,
    }}>{shortcut.title}</Text>
    <View style={{
      flex: 1,
      backgroundColor: colors.background,
      marginTop: 5,
      borderRadius: 15,
    }}>
      <HotkeyInput
        styles={{
          padding: 20,
          backgroundColor: 'transparent',
        }}
        hotkey={shortcut.hotkey}
        onPressHotkey={onSaveHotkey}
      ></HotkeyInput>
    </View>
  </>
}

const SettingsPlugin: FC<{
  title: string,
  shortcuts?: SpotterOptionShortcut[],
  onSaveHotkey: (hotkey: SpotterHotkey, plugin: string, option: string) => Promise<void>,
}> = ({
  title,
  shortcuts,
  onSaveHotkey,
}) => {
  return <>
    <View style={{
      marginBottom: 30
    }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        {title}
      </Text>
      <View style={{}}>
        {shortcuts?.map(s => (
          <SettingsPluginShortcut
            key={`${title}#${s.title}`}
            shortcut={s}
            onSaveHotkey={hotkey => onSaveHotkey(hotkey, title, s.title)}
          />
        ))}
      </View>
    </View>
  </>
}

export const Settings: FC<{}> = () => {

  const { api, registries } = useApi();
  const [spotterSettings, setSpotterSettings] = useState<SpotterSettings | null>(null);

  useEffect(() => {
    const setSettings = async () => {
      const settings = await registries.settings.getSettings()
      setSpotterSettings(settings);
    };

    setSettings();
  }, []);

  const onSaveHotkey = useCallback(async (hotkey: SpotterHotkey, plugin: string, option: string) => {
    const nextHotkey = hotkey.keyCode === null ? null : hotkey;
    if (plugin === 'Spotter') {
      await registries.settings.patchSettings({ hotkey: nextHotkey });
      registerNewHotkey(nextHotkey, SPOTTER_HOTKEY_IDENTIFIER);
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
    registerNewHotkey(nextHotkey, `${plugin}#${option}`);
  }, []);

  const registerNewHotkey = (hotkey: SpotterHotkey | null, action: string) => {
    api.globalHotKey.register(hotkey, action);
  };

  return (
    <ScrollView>
      <View style={{ margin: 15 }}>
        <Text style={{ fontSize: 28, marginBottom: 20 }}>Hotkeys</Text>
        <SettingsPlugin
          title='Spotter'
          shortcuts={[{
            title: 'Open',
            hotkey: spotterSettings?.hotkey,
          }]}
          onSaveHotkey={onSaveHotkey}
        />

        {Object.values(registries.plugins.list)
          .filter(p => p.options?.length)
          .map(plugin => (
            <SettingsPlugin
              key={plugin.identifier}
              title={plugin.identifier}
              shortcuts={plugin.options?.map(o => {
                const pluginHotkeys = spotterSettings?.pluginHotkeys[plugin.identifier];
                return {
                  title: o.title,
                  hotkey: pluginHotkeys ? pluginHotkeys[o.title] : null,
                }
              })}
              onSaveHotkey={onSaveHotkey}
            />
          ))
        }

        <SettingsWebsiteShortcuts />
      </View>
    </ScrollView>
  )
};

// TODO: Move to the Shortcuts plugin
const SettingsWebsiteShortcuts: FC<{}> = () => {
  const { colors } = useTheme();
  const [webShortcutList, setWebShortcutList] = useState<SpotterWebsiteShortcut[] | null>(null);
  const { api } = useApi();

  useEffect(() => {
    const setSettings = async () => {
      const webShortcuts = await api.storage.getItem<SpotterWebsiteShortcut[]>(WEBSTORAGE);
      setWebShortcutList(webShortcuts);
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
