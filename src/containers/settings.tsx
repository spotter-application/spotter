import React, { FC, useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { HotkeyInput } from '../native/hotkey-input.native';
import { SpotterHotkey, SpotterPluginHotkeys, SpotterSettings, SPOTTER_HOTKEY_IDENTIFIER } from '../core';
import { OptionIcon, useApi, useTheme } from '../components';
import spotterIcon from './icon.png';

export const Settings: FC<{}> = () => {

  const { api, registries } = useApi();
  const { colors } = useTheme();
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

  useEffect(() => {
    const setSettings = async () => {
      const settings = await registries.settings.getSettings()
      setSpotterSettings(settings);
    };

    setSettings();
  }, []);

  return (
    <ScrollView>
      <View style={{ margin: 15 }}>
        <Text style={{ fontSize: 28 }}>Hotkeys</Text>

        <View style={{ marginTop: 25 }}>
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: "center", marginBottom: 10 }}>
            <OptionIcon icon={spotterIcon} />
            <Text style={{ fontSize: 20, marginLeft: -5 }}>
              Spotter
            </Text>
          </View>
          <View style={{ marginLeft: 0, marginBottom: 15 }}>
            <Text style={{ fontSize: 16, marginLeft: 3 }}>Open</Text>
            <View style={{ flex: 1, backgroundColor: colors.background, marginTop: 5, borderRadius: 15 }}>
              <HotkeyInput
                styles={{ padding: 20, backgroundColor: 'transparent' }}
                hotkey={spotterSettings?.hotkey}
                onPressHotkey={onPressHotkey}
              ></HotkeyInput>
            </View>
          </View>
        </View>

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
