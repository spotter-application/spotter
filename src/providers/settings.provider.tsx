import { Settings } from '@spotter-app/core';
import React, { FC } from 'react';
import { useApi } from './api.provider';

const SETTINGS_STORAGE_KEY = 'SETTINGS';

type Context = {
  getSettings: () => Promise<Settings>;
  patchSettings: (settings: Partial<Settings>) => void;
  getPlugins: () => Promise<string[]>;
  addPlugin: (plugin: string) => void,
  removePlugin: (plugin: string) => void,
};

const initialSettings: Settings = {
  hotkey: { doubledModifiers: true, keyCode: 0, modifiers: 512 },
  pluginHotkeys: {},
  plugins: [],
};

const context: Context = {
  getSettings: () => Promise.resolve(initialSettings),
  patchSettings: () => null,
  getPlugins: () => Promise.resolve(initialSettings.plugins),
  addPlugin: () => Promise.resolve(),
  removePlugin: () => Promise.resolve(),
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
      plugins,
    } = settings;

    return {
      hotkey: hotkey ?? initialSettings.hotkey,
      pluginHotkeys: pluginHotkeys ?? initialSettings.pluginHotkeys,
      plugins: plugins ?? initialSettings.plugins,
    };
  }

  const patchSettings: (newSettings: Partial<Settings>) => void = async (newSettings) => {
    const settings = await getSettings();
    storage.setItem(SETTINGS_STORAGE_KEY, { ...settings, ...newSettings });
  }

  // TODO: remove
  const getPlugins: () => Promise<string[]> = async () => {
    const settings = await storage.getItem<Settings>(SETTINGS_STORAGE_KEY);
    if (!settings) {
      return initialSettings.plugins ?? [];
    }

    return settings.plugins ?? [];
  }

  // TODO: remove
  const addPlugin = async (plugin: string) => {
    const settings = await getSettings();
    const alreadyAdded = settings.plugins.find(p => p === plugin);

    if (alreadyAdded) {
      return;
    }

    const updatedPlugins = [...settings.plugins, plugin];

    patchSettings({plugins: updatedPlugins});
  };

  // TODO: remove
  const removePlugin = async (plugin: string) => {
    const settings = await getSettings();
    const alreadyRemoved = !settings.plugins.find(p => p === plugin);
    if (alreadyRemoved) {
      return;
    }

    const updatedPlugins = settings.plugins.filter(p => p !== plugin);
    patchSettings({plugins: updatedPlugins});
  };

  return (
    <SettingsContext.Provider value={{
      getSettings,
      patchSettings,
      getPlugins,
      addPlugin,
      removePlugin,
    }}>
      {props.children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => React.useContext(SettingsContext);
