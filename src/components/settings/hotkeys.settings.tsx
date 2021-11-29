import React, { FC, useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { HotkeyInput } from '../../native/ui/hotkey-input.ui';
import { useApi, useSettings, useTheme } from '../../providers';
import { Hotkey, PluginHotkeys, Settings } from '@spotter-app/core';
import { SPOTTER_HOTKEY_IDENTIFIER } from '../../constants';

interface SpotterOptionShortcut {
  title: string,
  hotkey?: Hotkey | null,
}

const SettingsPluginShortcut: FC<{
  shortcut: SpotterOptionShortcut,
  onSaveHotkey: (hotkey: Hotkey) => Promise<void>,
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
  onSaveHotkey: (hotkey: Hotkey, plugin: string, option: string) => Promise<void>,
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

  const [spotterSettings, setSpotterSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const setSettings = async () => {
      const settings = await getSettings();
      setSpotterSettings(settings);
    };

    setSettings();
  }, []);

  const onSaveHotkey = useCallback(async (hotkey: Hotkey, plugin: string, option: string) => {
    const nextHotkey = hotkey.keyCode === null ? null : hotkey;
    if (plugin === 'Spotter') {
      patchSettings({ hotkey: nextHotkey });
      registerNewHotkey(nextHotkey, SPOTTER_HOTKEY_IDENTIFIER);
      return;
    }

    const pluginHotkeys: PluginHotkeys = {
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

  const registerNewHotkey = (hotkey: Hotkey | null, action: string) => {
    api.hotkey.register(hotkey, action);
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
