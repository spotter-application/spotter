import React, { FC } from 'react';
import { SpotterHotkey, SpotterPluginHotkeys } from '../core';
import { useApi } from './api.provider';

// TODO: rename to SETTINGS
const SETTINGS_STORAGE_KEY = 'STORAGE_KEY';

export interface Settings {
  hotkey: SpotterHotkey | null;
  pluginHotkeys: SpotterPluginHotkeys;
  plugins: string[];
  pluginsPreinstalled: boolean;
}

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
  pluginsPreinstalled: false,
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

  const { api } = useApi();

  const getSettings: () => Promise<Settings> = async () => {
    const settings = await api.storage.getItem<Settings>(SETTINGS_STORAGE_KEY);
    if (!settings) {
      return initialSettings;
    }

    const {
      hotkey,
      pluginHotkeys,
      plugins,
      pluginsPreinstalled,
    } = settings;

    return {
      hotkey: hotkey ?? initialSettings.hotkey,
      pluginHotkeys: pluginHotkeys ?? initialSettings.pluginHotkeys,
      plugins: plugins ?? initialSettings.plugins,
      pluginsPreinstalled: pluginsPreinstalled ?? initialSettings.pluginsPreinstalled,
    };
  }

  const patchSettings: (newSettings: Partial<Settings>) => void = async (newSettings) => {
    const settings = await getSettings();
    api.storage.setItem(SETTINGS_STORAGE_KEY, { ...settings, ...newSettings });
  }

  const getPlugins: () => Promise<string[]> = async () => {
    const settings = await api.storage.getItem<Settings>(SETTINGS_STORAGE_KEY);
    if (!settings) {
      return initialSettings.plugins ?? [];
    }

    return settings.plugins ?? [];
  }

  const addPlugin = async (plugin: string) => {
    const settings = await getSettings();
    const alreadyAdded = settings.plugins.find(p => p === plugin);

    if (alreadyAdded) {
      return;
    }

    const updatedPlugins = [...settings.plugins, plugin];

    patchSettings({plugins: updatedPlugins});
  };

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
