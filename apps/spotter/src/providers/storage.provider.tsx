import { Storage } from '@spotter-app/core';
import React, { FC, useRef } from 'react';
import { useApi } from './api.provider';
// import {
//  SPOTIFY_CLIENT_ID,
//  SPOTIFY_REDIRECT_URI,
//  SPOTIFY_CLIENT_SECRET,
// } from '@env';

const STORAGE_KEY = 'STORAGE';

type Context = {
  getStorage: <T>(plugin?: string) => Promise<Storage<T>>;
  patchStorage: <T>(data: Partial<Storage<T>>, plugin?: string) => void;
  setStorage: <T>(data: Storage<T>, plugin?: string) => void;
};

const spotifyTokens = {
  // TODO: check
  // clientId: SPOTIFY_CLIENT_ID,
  // clientSecret: SPOTIFY_CLIENT_SECRET,
  // redirectUri: SPOTIFY_REDIRECT_URI,
};

const TOKENS: {[key: string]: any} = {
  ['spotify-plugin']: spotifyTokens,
};

const context: Context = {
  getStorage: () => Promise.resolve<any>({}),
  patchStorage: () => null,
  setStorage: () => null,
}

export const StorageContext = React.createContext<Context>(context);

export const StorageProvider: FC<{}> = (props) => {

  const { storage } = useApi();

  const cachedStorage = useRef<Storage<any>>();

  const getStorage = async (pluginName?: string): Promise<Storage<any>> => {
    const plugin = Object.keys(TOKENS).find(p => pluginName?.includes(p));
    const tokens: Storage<any> = plugin ? { tokens: TOKENS[plugin] } : {};

    if (cachedStorage.current) {
      return {
        ...(pluginName
          ? (cachedStorage.current[pluginName] ?? {})
          : cachedStorage.current
        ),
        ...tokens,
      };
    }

    const currentStorage = await storage.getItem<Storage<any>>(STORAGE_KEY);
    if (!currentStorage) {
      return tokens;
    }

    cachedStorage.current = currentStorage;
    return {
      ...(pluginName
        ? (currentStorage[pluginName] ?? {})
        : currentStorage
      ),
      ...tokens,
    };
  }

  const setStorage = async (data: Storage<any>, pluginName?: string) => {
    const currentStorage = await getStorage();
    const updatedStorage: Storage<any> = {
      ...currentStorage,
      ...(pluginName ? {[pluginName]: data} : {data}),
    };

    cachedStorage.current = updatedStorage;
    storage.setItem(STORAGE_KEY, updatedStorage);
  }

  const patchStorage = async (data: Storage<any>, pluginName?: string) => {
    const currentStorage = await getStorage();
    const currentPluginStorage = pluginName ? currentStorage[pluginName] ?? {} : {};
    const nextPluginStorage = pluginName
      ? {[pluginName]: {
          ...currentPluginStorage,
          ...data,
        }}
      : {};

    const nextStorage = {
      ...currentStorage,
      ...nextPluginStorage,
    };

    cachedStorage.current = nextStorage;
    storage.setItem(STORAGE_KEY, nextStorage);
  }

  return (
    <StorageContext.Provider value={{
      getStorage,
      patchStorage,
      setStorage,
    }}>
      {props.children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => React.useContext(StorageContext);
