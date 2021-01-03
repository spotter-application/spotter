import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { HotkeyInput } from './core/native/hotkey-input.native';
import { SettingsRegistry } from './core/settings.registry';
import { SpotterHotkey, SpotterNativeModules } from './core/shared';

const settingsRegistry = new SettingsRegistry();

export const Settings = ({ nativeModules }: { nativeModules: SpotterNativeModules }) => {

  const [currentHotkey, setCurrentHotkey] = useState<SpotterHotkey | null>(null);

  const onPressHotkey = useCallback(async (hotkey: SpotterHotkey) => {
    const nextHotkey = hotkey.keyCode === null ? null : hotkey;
    await settingsRegistry.patchSettings({ hotkey: nextHotkey });
    nativeModules.globalHotKey.register(nextHotkey);
    nativeModules.globalHotKey.onPress(() => nativeModules.panel.open());
  }, []);

  useEffect(() => {
    const setSettings = async () => {
      const settings = await settingsRegistry.getSettings()
      setCurrentHotkey(settings?.hotkey);
    };

    setSettings();
  }, []);

  return (
    <ScrollView>
      <View style={{ margin: 15 }}>
        <Text style={{ fontSize: 20 }}>Hotkeys</Text>
      </View>

      <View style={styles.hotkeyContainer}>
        <View style={{ flex: 1 }}>
          <HotkeyInput
            styles={{ padding: 20, backgroundColor: 'transparent' }}
            hotkey={currentHotkey}
            onPressHotkey={onPressHotkey}
          ></HotkeyInput>
        </View>
        <View style={{
          backgroundColor: 'rgba(0, 0, 0, 0.20)',
          padding: 15,
        }}>
          <Text style={{ fontSize: 18 }}>spotter</Text>
        </View>
      </View>
    </ScrollView>
  )
};

const styles = StyleSheet.create({
  hotkeyContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    marginLeft: 15,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
  }
});
