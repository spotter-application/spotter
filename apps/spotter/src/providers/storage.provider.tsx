import { Storage } from '@spotter-app/core';
import React, { FC, useRef } from 'react';
import { useApi } from './api.provider';
// import { env } from '../../env';

const STORAGE_KEY = 'STORAGE';

type Context = {
  getStorage: <T>(port?: number) => Promise<Storage<T>>;
  patchStorage: <T>(data: Partial<Storage<T>>, port?: number) => void;
  setStorage: <T>(data: Storage<T>, port?: number) => void;
};

// const TOKENS: {[key: string]: any} = {
//   ['@spotter-app/spotify-plugin']: env.spotify,
// };

const context: Context = {
  getStorage: () => Promise.resolve<any>({}),
  patchStorage: () => null,
  setStorage: () => null,
}

export const StorageContext = React.createContext<Context>(context);

export const StorageProvider: FC<{}> = (props) => {
  const { storage } = useApi();

  const cachedStorage = useRef<Storage<any>>();

  const getStorage = async (port?: number): Promise<Storage<any>> => {

    // const plugin = Object.keys(TOKENS).find(p => port?.includes(p));
    // const tokens: Storage<any> = plugin ? { tokens: TOKENS[plugin] } : {};

    if (cachedStorage.current) {
      return {
        ...(port
          ? (cachedStorage.current[port] ?? {})
          : cachedStorage.current
        ),
        // ...tokens,
      };
    }

    const currentStorage = await storage.getItem<Storage<any>>(STORAGE_KEY);
    if (!currentStorage) {
      return {};
    }

    cachedStorage.current = currentStorage;
    return {
      ...(port
        ? (currentStorage[port] ?? {})
        : currentStorage
      ),
      // ...tokens,
    };
  }

  const setStorage = async (data: Storage<any>, port?: number) => {
    const currentStorage = await getStorage();
    const updatedStorage: Storage<any> = {
      ...currentStorage,
      ...(port ? {[port]: data} : {data}),
    };

    cachedStorage.current = updatedStorage;
    storage.setItem(STORAGE_KEY, updatedStorage);
  }

  const patchStorage = async (data: Storage<any>, port?: number) => {
    const currentStorage = await getStorage();
    const currentPluginStorage = port ? currentStorage[port] ?? {} : {};
    const nextPluginStorage = port
      ? {[port]: {
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
