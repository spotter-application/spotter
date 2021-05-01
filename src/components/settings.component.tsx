import React, { FC, useCallback, useEffect, useState } from 'react';
import {Alert, Button, ScrollView, Switch, Text, TextInput, TouchableOpacity, View} from 'react-native';
import { HotkeyInput } from '../core/native/hotkey-input.native';
import {
  SpotterHotkey,
  SpotterPluginHotkeys,
  SpotterSettings,
  SPOTTER_HOTKEY_IDENTIFIER,
  SpotterWebsiteShortcut,
  getAllApplications,
  Application,
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

enum Pages {
  general = 'general',
  themes = 'themes',
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

const ThemesSettings: FC<{}> = () => {
  return <View>
    <Text>THEMES SETTINGS</Text>
  </View>
}

const GeneralSettings: FC<{}> = () => {

  const { api } = useApi();
  const [launchAtLoginEnabled, setLaunchAtLoginEnabled] = useState<boolean>(false);
  const [spotterApp, setSpotterApp] = useState<Application | undefined>();

  useEffect(() => {
    const setSettings = async () => {
      const loginItems = await api.shell.execute(`osascript -e 'tell application "System Events" to delete login item "spotter"' || echo ''`);
      const launchAtLoginStatus = !!loginItems.split('\n').find(item => item === 'spotter');
      setLaunchAtLoginEnabled(launchAtLoginStatus);

      const apps = await getAllApplications(api.shell);
      const app = apps.find(app => app.title === 'spotter');
      setSpotterApp(app);
    };

    setSettings();
  }, []);

  const onChangeLaunchAtLogin = (value: boolean) => {
    if (value) {
      if (!spotterApp) {
        Alert.alert('You have to move Spotter.app to Applications folder');
        return;
      }
      api.shell.execute(`osascript -e 'tell application "System Events" to make login item at end with properties {path:"${spotterApp?.path}", hidden:false}'`)
    } else {
      api.shell.execute(`osascript -e 'tell application "System Events" to delete login item "spotter"'`)
    }
    setLaunchAtLoginEnabled(value);
  };

  return <View>
      <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={launchAtLoginEnabled ? "#f5dd4b" : "#f4f3f4"}
          onValueChange={onChangeLaunchAtLogin}
          value={launchAtLoginEnabled}
          style={{width: 25}}
        ></Switch>
        <Text>Auto launch</Text>
      </View>
  </View>
}

const HotkeysSettings: FC<{}> = () => {

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

  return <View>
    {/* <Text style={{ fontSize: 28, marginBottom: 20 }}>Hotkeys</Text> */}
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
}

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
