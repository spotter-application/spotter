import { Hotkey, Settings } from '@spotter-app/core';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Alert, Switch, Text, View } from 'react-native';
import { SPOTTER_HOTKEY_IDENTIFIER } from '../../constants';
import { SpotterThemeColors } from '../../interfaces';
import { useApi, useSettings } from '../../providers';
import { ShortcutInput } from './hotkey.settings';
import FS from 'react-native-fs';

export const GeneralSettings: FC<{colors?: SpotterThemeColors}> = ({colors}) => {

  const { shell, hotkey } = useApi();
  const { getSettings, patchSettings } = useSettings();
  const [launchAtLoginEnabled, setLaunchAtLoginEnabled] = useState<boolean>(false);
  const [spotterSettings, setSpotterSettings] = useState<Settings>();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setSettings();
    setSpotterSettings(await getSettings());
  }

  const setSettings = async () => {
    const loginItems = await shell.execute('osascript -e \'tell application "System Events" to get the name of every login item\' || echo \'\'');
    const launchAtLoginStatus = !!loginItems.split(',').find((item: string) => item.includes('Spotter'));

    setLaunchAtLoginEnabled(launchAtLoginStatus);
  };

  const onChangeLaunchAtLogin = (value: boolean) => {
    if (value) {
      if (!FS.MainBundlePath) {
        Alert.alert('You have to move Spotter.app to Applications folder');
        return;
      }
      const properties = `{path:\"${FS.MainBundlePath}\", hidden:false}`
      shell.execute(`osascript -e 'tell application "System Events" to make login item at end with properties ${properties}'`)
    } else {
      shell.execute('osascript -e \'tell application "System Events" to delete login item "Spotter"\'')
    }
    setLaunchAtLoginEnabled(value);
  };

  const onSaveHotkey = useCallback(async (hotkey: Hotkey) => {
    const nextHotkey = hotkey.keyCode === null ? null : hotkey;
    patchSettings({ hotkey: nextHotkey });
    registerNewHotkey(nextHotkey, SPOTTER_HOTKEY_IDENTIFIER);
  }, []);

  const registerNewHotkey = (shortcut: Hotkey | null, action: string) => {
    hotkey.register(shortcut, action);
  };

  return <View>
    <Text style={{
      fontSize: 26,
      marginBottom: 20,
      color: colors?.text,
    }}>Open</Text>

    <Text style={{
      fontSize: 16,
      marginBottom: 5,
      color: colors?.text,
    }}>Startup</Text>
    <View style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    }}>
      <Switch
        onValueChange={onChangeLaunchAtLogin}
        value={launchAtLoginEnabled}
        style={{width: 25}}
      ></Switch>
      <Text style={{
        color: colors?.text,
      }}>Run automatically at startup</Text>
    </View>

    <View style={{ flexDirection: 'column', marginTop: 20 }}>
      <Text style={{
        fontSize: 16,
        color: colors?.text,
      }}>Hotkey</Text>
      <ShortcutInput
        hotkey={spotterSettings?.hotkey}
        colors={colors}
        onSaveHotkey={onSaveHotkey}
      />
    </View>

    <View style={{
      height: 2,
      backgroundColor:
      colors?.text,
      marginTop: 20,
      marginBottom: 20,
      opacity: 0.3,
    }}></View>
    <View style={{ marginTop: 0 }}>
      <Text style={{
        fontSize: 26,
        marginBottom: 10,
        color: colors?.text,
      }}>Commands</Text>
      <Command colors={colors} title='Check version' query='-v' withEnter={false} />
      <Command colors={colors} title='Plugins list' query='plugins' withEnter={true} />
      <Command colors={colors} title='Help' query='?' withEnter={false} />
    </View>
  </View>
}

const Command: FC<{
  title: string,
  colors?: SpotterThemeColors,
  query: string,
  withEnter: boolean,
}> = ({ title, colors, query, withEnter }) => {
  return <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
    <Text style={{
      fontSize: 14,
      width: 120,
      color: colors?.text,
    }}>{title}</Text>
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Query colors={colors} query={query} /> 
      {withEnter && <Text style={{ color: colors?.text }}> + enter</Text>}
    </View>
  </View>
}

const Query: FC<{
  colors?: SpotterThemeColors,
  query: string,
}> = ({ colors, query }) => {
  return <View style={{
    backgroundColor: colors?.text,
    position: 'relative',
    display: 'flex',
    overflow: 'hidden',
    padding: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
    paddingRight: 10,
  }}>
    <View style={{
      position: 'absolute',
      backgroundColor: colors?.text,
      opacity: 0.2,
    }}></View>
    <Text style={{ color: colors?.background }}>{query}</Text>
    <View style={{
      position: 'absolute',
      backgroundColor: colors?.background,
      width: 2,
      height: 18,
      right: 6,
      top: 5,
    }}></View>
  </View>
}