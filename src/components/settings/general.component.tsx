import React, { FC, useEffect, useState } from 'react';
import { Alert, Switch, Text, View } from 'react-native';
import {
  getAllApplications,
  Application,
} from '../../core';
import { useApi } from '../../providers';

export const GeneralSettings: FC<{}> = () => {

  const { api } = useApi();
  const [launchAtLoginEnabled, setLaunchAtLoginEnabled] = useState<boolean>(false);
  const [spotterApp, setSpotterApp] = useState<Application | undefined>();

  useEffect(() => {
    const setSettings = async () => {
      const loginItems = await api.shell.execute(`osascript -e 'tell application "System Events" to get the name of every login item' || echo ''`);
      const launchAtLoginStatus = !!loginItems.split(',').find(item => item === 'spotter');

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
