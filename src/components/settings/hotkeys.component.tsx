import React, { FC, useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { HotkeyInput } from '../../core/native/hotkey-input.native';
import {
  SpotterHotkey,
  SpotterPluginHotkeys,
  SpotterSettings,
  SPOTTER_HOTKEY_IDENTIFIER,
} from '../../core';
import { useApi, useSettings, useTheme } from '../../providers';

interface SpotterOptionShortcut {
  title: string,
  hotkey?: SpotterHotkey | null,
}

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

export const HotkeysSettings: FC<{}> = () => {

  const { api } = useApi();
  const { getSettings, patchSettings } = useSettings();

  const [spotterSettings, setSpotterSettings] = useState<SpotterSettings | null>(null);

  useEffect(() => {
    const setSettings = async () => {
      const settings = await getSettings();
      setSpotterSettings(settings);
    };

    setSettings();
  }, []);

  const onSaveHotkey = useCallback(async (hotkey: SpotterHotkey, plugin: string, option: string) => {
    const nextHotkey = hotkey.keyCode === null ? null : hotkey;
    if (plugin === 'Spotter') {
      patchSettings({ hotkey: nextHotkey });
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

    patchSettings({ pluginHotkeys });
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

    {/* {Object.values(registries.plugins.list)
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
    } */}
  </View>
}
