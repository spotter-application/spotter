import React, { FC, useEffect } from 'react';
import { Appearance } from 'react-native';
import { SpotterThemeColors } from '../interfaces';

type Context = {
  isDark: boolean,
  colors: SpotterThemeColors,
};

const themes: { [theme: string]: SpotterThemeColors } = {
  light: {
    background: '#efefef',
    text: '#101010',
    activeOptionBackground: '#dddddd',
    activeOptionText: '#000000',
    hoveredOptionBackground: '#0f60cf',
    hoveredOptionText: '#fefefe',
  },
  dark: {
    background: '#212121',
    text: '#ffffff',
    activeOptionBackground: '#3c3c3c',
    activeOptionText: '#ffffff',
    hoveredOptionBackground: '#0f60cf',
    hoveredOptionText: '#fefefe',
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
