import React, { FC, useEffect, useState } from 'react';
import { SpotterHotkey, SpotterPluginHotkeys } from '../core';
import { useApi } from './api.provider';

// TODO: rename to SETTINGS
const SETTINGS_STORAGE_KEY = 'STORAGE_KEY';

interface Settings {
  hotkey: SpotterHotkey | null;
  pluginHotkeys: SpotterPluginHotkeys;
}

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

  const { api } = useApi();

  useEffect(() => {
    getSettings();
  }, [])

  const getSettings: () => Promise<Settings> = async () => {
    const settings = await api.storage.getItem<Settings>(SETTINGS_STORAGE_KEY);
    return settings ?? initialSettings;
  }

  const patchSettings: (newSettings: Partial<Settings>) => void = async (newSettings) => {
    const settings = await getSettings();
    api.storage.setItem(SETTINGS_STORAGE_KEY, { ...settings, ...newSettings });
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
