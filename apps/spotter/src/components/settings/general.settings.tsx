import React, { FC, useEffect, useState } from 'react';
import { Alert, Switch, Text, View } from 'react-native';
import { useApi } from '../../providers';

export const GeneralSettings: FC<{}> = () => {

  const { shell } = useApi();
  const [launchAtLoginEnabled, setLaunchAtLoginEnabled] = useState<boolean>(false);
  const [spotterPath, setSpotterPath] = useState<string>();

  useEffect(() => {
    const setSettings = async () => {
      const loginItems = await shell.execute('osascript -e \'tell application "System Events" to get the name of every login item\' || echo \'\'');
      const launchAtLoginStatus = !!loginItems.split(',').find((item: string) => item.includes('Spotter'));

      setLaunchAtLoginEnabled(launchAtLoginStatus);

      const spotterPath = await shell.execute('osascript -e \'POSIX path of (path to application "Spotter")\'');

      setSpotterPath(spotterPath);
    };

    setSettings();
  }, []);

  const onChangeLaunchAtLogin = (value: boolean) => {
    if (value) {
      if (!spotterPath) {
        Alert.alert('You have to move Spotter.app to Applications folder');
        return;
      }
      const properties = `{path:\"${spotterPath}\", hidden:false}`
      shell.execute(`osascript -e 'tell application "System Events" to make login item at end with properties ${properties}'`)
    } else {
      shell.execute('osascript -e \'tell application "System Events" to delete login item "Spotter"\'')
    }
    setLaunchAtLoginEnabled(value);
  };

  return <View>
      <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={launchAtLoginEnabled ? '#f5dd4b' : '#f4f3f4'}
          onValueChange={onChangeLaunchAtLogin}
          value={launchAtLoginEnabled}
          style={{width: 25}}
        ></Switch>
        <Text>Auto launch</Text>
      </View>
  </View>
}
