
import React, { FC, useEffect } from 'react';
import { Appearance } from 'react-native';
import { SpotterThemeColors } from '../core';

type Context = {
  isDark: boolean,
  colors: SpotterThemeColors,
};

const themes: { [theme: string]: SpotterThemeColors } = {
  light: {
    background: '#ffffff',
    border: 'rgba(0, 0, 0, 0.05)',
    text: '#000000',
    description: 'rgba(0, 0, 0, 0.3)',
    active: {
      background: '#1877dd',
      border: 'rgba(0, 0, 0, 0.05)',
      text: '#ffffff',
      description: 'rgba(255, 255, 255, 0.5)',
    },
  },
  dark: {
    background: '#212121',
    border: 'rgba(255, 255, 255, 0.05)',
    text: '#ffffff',
    description: 'rgba(255, 255, 255, 0.3)',
    active: {
      background: '#1877dd',
      border: 'rgba(255, 255, 255, 0.01)',
      text: '#ffffff',
      description: 'rgba(255, 255, 255, 0.5)',
    },
  },
};

export const ThemeContext = React.createContext<Context>({
  isDark: false,
  colors: themes.light,
});

export const ThemeProvider: FC<{}> = (props) => {

  const [isDark, setIsDark] = React.useState(Appearance.getColorScheme() === 'dark');

  useEffect(() => {
    Appearance.addChangeListener(preferences => {
      setIsDark(preferences.colorScheme === 'dark');
    });
  }, []);

  const theme = {
    isDark,
    colors: isDark ? themes.dark : themes.light,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => React.useContext(ThemeContext);
