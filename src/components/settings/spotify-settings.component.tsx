import React, { FC, useEffect, useState } from 'react';
import {Text, TextInput, View} from 'react-native';
import {useApi, useTheme} from '../../providers';

export const SpotifySettings: FC<{}> = () => {
  const { colors } = useTheme();
  const { api } = useApi();
  const [clientId, setClientId] = useState<String | null>(null);
  const [clientSecret, setClientSecret] = useState<String | null>(null);

  useEffect(() => {
    const setSettings = async () => {
      setClientId(await api.storage.getItem("SpotifyClientID"))
      setClientSecret(await api.storage.getItem("SpotifyClientSecret"))
    };

    setSettings();
  }, []);

  const textUpdateClient = async (t: string) => {
    await api.storage.setItem("SpotifyClientID", t);
  }

  const textUpdateSecret = async (t: string) => {
    await api.storage.setItem("SpotifyClientSecret", t);
  }


  return <View>
    <View style={{display: 'flex', justifyContent: 'flex-start'}}>
      <Text
        style={{
          marginBottom: 25,
          fontSize: 20,
          color: colors.text,
        }}
      >Spotify Tokens</Text>
      <TextInput
        style={{
          width: "100%",
          height: 30,
          flex: 1,
          fontSize: 16,
          paddingTop: 4,
          borderRadius: 4,
          backgroundColor: colors.background,
          justifyContent: 'flex-start',
        }}
        defaultValue ={clientId?.toString()|| "Spotify Client Key"}
        placeholderTextColor={colors.text}
        autoCapitalize = "none"
        onChangeText = {textUpdateClient}
      />
      <TextInput
        style={{
          marginTop: 20,
          width: "100%",
          height: 30,
          flex: 1,
          fontSize: 16,
          paddingTop: 4,
          borderRadius: 4,
          backgroundColor: colors.background,
          justifyContent: 'flex-start',
        }}
        defaultValue= {clientSecret?.toString() || "Spotify Client Key"}
        placeholderTextColor={colors.text}
        autoCapitalize = "none"
        onChangeText = {textUpdateSecret}
      />
    </View>
  </View>
}
