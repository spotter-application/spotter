import { Settings } from '@spotter-app/core';
import React, { FC } from 'react';
import { Appearance } from 'react-native';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { DARK_THEME, LIGHT_THEME } from '../constants';
import { parseTheme } from '../helpers';
import { SpotterThemeColors } from '../interfaces';
import { useApi } from './api.provider';

const SETTINGS_STORAGE_KEY = 'SETTINGS_0.1';

type Context = {
  getSettings: () => Promise<Settings>,
  patchSettings: (settings: Partial<Settings>) => void,
  setTheme: (theme: string) => void,
  colors$: Observable<SpotterThemeColors>,
};

const initialSettings: Settings = {
  hotkey: { doubledModifiers: true, keyCode: 0, modifiers: 512 },
  pluginHotkeys: {},
};

const context: Context = {
  getSettings: () => Promise.resolve(initialSettings),
  patchSettings: () => null,
  setTheme: () => null,
  colors$: of(Appearance.getColorScheme() === 'dark' ? DARK_THEME : LIGHT_THEME),
}

export const SettingsContext = React.createContext<Context>(context);

export const SettingsProvider: FC<{}> = (props) => {

  const { storage } = useApi();

  const colorsSubject$ = new BehaviorSubject<SpotterThemeColors>(
    Appearance.getColorScheme() === 'dark' ? DARK_THEME : LIGHT_THEME
  );

  // useEffect(() => {
    // TODO: set dark/light themes
    // Appearance.addChangeListener(preferences => {
    //   setIsDark(preferences.colorScheme === 'dark');
    // });
  // }, []);

  const getSettings: () => Promise<Settings> = async () => {
    const settings = await storage.getItem<Settings>(SETTINGS_STORAGE_KEY);
    if (!settings) {
      return initialSettings;
    }

    const {
      hotkey,
      pluginHotkeys,
    } = settings;

    return {
      hotkey: hotkey ?? initialSettings.hotkey,
      pluginHotkeys: pluginHotkeys ?? initialSettings.pluginHotkeys,
    };
  }

  const patchSettings: (newSettings: Partial<Settings>) => void = async (newSettings) => {
    const settings = await getSettings();
    storage.setItem(SETTINGS_STORAGE_KEY, { ...settings, ...newSettings });
  }

  const setTheme = (theme: string) => {
    const nextTheme = parseTheme(theme);
    if (!nextTheme) {
      console.error('Can not parse theme.');
      return;
    }

    colorsSubject$.next(nextTheme);
  }

  return (
    <SettingsContext.Provider value={{
      getSettings,
      patchSettings,
      setTheme,
      colors$: colorsSubject$.asObservable(),
    }}>
      {props.children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => React.useContext(SettingsContext);
