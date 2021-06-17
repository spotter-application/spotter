import React, { FC } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../providers';

export const ThemesSettings: FC<{}> = ({}) => {
  const { colors } = useTheme();

  return <>
    <View style={{
      flex: 1,
      backgroundColor: colors.background,
      marginTop: 5,
      borderRadius: 15,
    }}>
      <Text>themes</Text>
    </View>
  </>
}
