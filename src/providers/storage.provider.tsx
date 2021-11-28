import { Storage } from '@spotter-app/core';
import React, { FC, useRef } from 'react';
import { useApi } from './api.provider';
import {
 SPOTIFY_CLIENT_ID,
 SPOTIFY_REDIRECT_URI,
 SPOTIFY_CLIENT_SECRET,
} from '@env';

const PLUGINS_STORAGE_KEY = 'PLUGINS_STORAGE';

type Context = {
  getStorage: (plugin?: string) => Promise<Storage>;
  patchStorage: (data: Storage) => void;
};

const tokens = {
  spotify: {
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    redirectUri: SPOTIFY_REDIRECT_URI,
  },
};

const context: Context = {
  getStorage: () => Promise.resolve({}),
  patchStorage: () => null,
}

export const StorageContext = React.createContext<Context>(context);

export const StorageProvider: FC<{}> = (props) => {

  const { api } = useApi();

  const cachedStorage = useRef<Storage>();

  const getStorage = async (plugin?: string) => {
    if (cachedStorage.current) {
      return {
        ...(plugin
          ? (cachedStorage.current[plugin] ?? {})
          : cachedStorage.current
        ),
        tokens,
      };
    }

    const storage = await api.storage.getItem<Storage>(PLUGINS_STORAGE_KEY);
    if (!storage) {
      return {tokens};
    }

    cachedStorage.current = storage;
    return {
      ...(plugin
        ? (storage[plugin] ?? {})
        : storage
      ),
      tokens,
    };
  }

  const patchStorage = async (data: Storage) => {
    const storage = await getStorage();
    const updatedStorage = {
      ...storage,
      ...data,
    };

    cachedStorage.current = updatedStorage;
    api.storage.setItem(PLUGINS_STORAGE_KEY, updatedStorage);
  }

  return (
    <StorageContext.Provider value={{
      getStorage,
      patchStorage,
    }}>
      {props.children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => React.useContext(StorageContext);
