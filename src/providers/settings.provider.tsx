import { Settings } from '@spotter-app/core';
import React, { FC } from 'react';
import { useApi } from './api.provider';

const SETTINGS_STORAGE_KEY = 'SETTINGS_0.1';

type Context = {
  getSettings: () => Promise<Settings>;
  patchSettings: (settings: Partial<Settings>) => void;
};

const initialSettings: Settings = {
  hotkey: { doubledModifiers: true, keyCode: 0, modifiers: 512 },
  pluginHotkeys: {},
};

const context: Context = {
  getSettings: () => Promise.resolve(initialSettings),
  patchSettings: () => null,
}

export const SettingsContext = React.createContext<Context>(context);

export const SettingsProvider: FC<{}> = (props) => {

  const { storage } = useApi();

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

  return (
    <SettingsContext.Provider value={{
      getSettings,
      patchSettings,
    }}>
      {props.children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => React.useContext(SettingsContext);
