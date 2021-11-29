import React, { FC } from 'react';
import { Switch, Text, View } from 'react-native';
import { useTheme } from '../../providers';
import { OptionHotkeyHint, OptionIcon } from '../queryPanel/options.queryPanel';

interface ThemeProps {
  backgroundColor?: string,
  color?: string,
  fontSize?: number,
  borderRadius?: number,
  padding?: number,
  margin?: number,
  marginTop?: number,
  marginRight?: number,
  marginBottom?: number,
  marginLeft?: number,
}

interface Theme {
  general: ThemeProps,
  query: ThemeProps & {
    text: ThemeProps,
    option: ThemeProps & { icon: ThemeProps, text: ThemeProps, },
    hint: ThemeProps,
  },
  options: ThemeProps & {
    option: ThemeProps & {
      text: ThemeProps,
      icon: ThemeProps,
      active: ThemeProps & { text: ThemeProps },
      hint: ThemeProps,
    },
  },
};

const theme: Theme = {
  general: {
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 16,
    borderRadius: 20,
  },
  query: {
    backgroundColor: 'green',
    borderRadius: 10,
    padding: 10,

    text: {
      fontSize: 16,
    },

    option: {
      backgroundColor: 'grey',
      color: '#000',
      borderRadius: 10,
      padding: 5,
      marginRight: 10,

      text: {
        fontSize: 14,
      },

      icon: {
        marginRight: 1,
      },
    },
    hint: {},
  },
  options: {
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 5,

    option: {
      backgroundColor: 'brown',
      padding: 10,
      fontSize: 16,
      borderRadius: 10,
      margin: 10,
      marginTop: 0,
      marginBottom: 5,

      icon: {
        marginRight: 3,
      },
      text: {
        fontSize: 29,
      },
      active: {
        backgroundColor: 'black',
        color: 'white',

        text: {},
      },
      hint: {},
    }
  }
};

const ThemePreview: FC<{ theme: Theme }> = ({theme: {
  general,
  query,
  options
}}) => {
  return <View style={{ ...general }}>
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      ...query,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <View style={{
            ...query.option,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <OptionIcon icon={'/Applications/spotter.app'} style={{
              ...query.option.icon,
            }}></OptionIcon>
            <Text style={{ ...query.option.text }}>Spotter</Text>
          </View>
          <Text style={{ ...query.text }}>Query...</Text>
        </View>
        <OptionHotkeyHint style={{ ...query.hint, }} placeholder='enter'/>
      </View>
    </View>
    <View style={{
      ...options,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      overflow: 'hidden',
    }}>
      <View style={{
        ...options.option,
        ...options.option.active,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <OptionIcon icon={'/Applications/spotter.app'} style={{
          ...options.option.icon,
        }}></OptionIcon>
        <Text style={{
          ...options.option.text,
          ...options.option.active.text,
        }}>Settings</Text>
      </View>
      <View style={{
        ...options.option,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <OptionIcon icon={'/Applications/spotter.app'} style={{
          ...options.option.icon,
        }}></OptionIcon>
        <Text style={{ ...options.option.text }}>Close</Text>
      </View>
    </View>
  </View>
}

export const ThemeSelect: FC<{
  selected: boolean,
  name: string,
  theme: Theme,
}> = ({
  selected,
  name,
  theme,
}) => {
  return <View style={{
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 5,
    width: 265,
    height: 140,
    position: 'relative',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    marginBottom: 10,
    marginRight: 10,
  }}>
    <View style={{
      position: 'absolute',
      transform: [{ scale: 0.5 }],
      height: 100,
      width: '185%',
      marginHorizontal: 10,
      marginTop: 10,
      top: 0,
    }}>
      <ThemePreview theme={theme} />
    </View>
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
    }}>
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        // thumbColor={launchAtLoginEnabled ? "#f5dd4b" : "#f4f3f4"}
        // onValueChange={onChangeLaunchAtLogin}
        value={selected}
        style={{width: 25}}
      ></Switch>
      <Text>{name}</Text>
    </View>
  </View>
}

export const ThemesSettings: FC<{}> = ({}) => {
  const { colors } = useTheme();

  return <>
    <View style={{
      flex: 1,
      marginTop: 5,
      borderRadius: 15,
      flexDirection: 'row',
      flexWrap: 'wrap',
    }}>
      <ThemeSelect name='Theme 1' theme={theme} selected={true} />
      <ThemeSelect name='Theme 2' theme={theme} selected={true} />
      <ThemeSelect name='Theme 3' theme={theme} selected={true} />
    </View>
  </>
}
