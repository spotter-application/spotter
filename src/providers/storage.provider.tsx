import { Storage } from '@spotter-app/core';
import React, { FC, useRef } from 'react';
import { useApi } from './api.provider';

const PLUGINS_STORAGE_KEY = 'PLUGINS_STORAGE';

type Context = {
  getStorage: () => Promise<Storage>;
  patchStorage: (data: Storage) => void;
};

const context: Context = {
  getStorage: () => Promise.resolve({}),
  patchStorage: () => null,
}

export const StorageContext = React.createContext<Context>(context);

export const StorageProvider: FC<{}> = (props) => {

  const { api } = useApi();

  const cachedStorage = useRef<Storage>();

  const getStorage = async () => {
    if (cachedStorage.current) {
      return cachedStorage.current;
    }

    const storage = await api.storage.getItem<Storage>(PLUGINS_STORAGE_KEY);
    if (!storage) {
      return {};
    }

    cachedStorage.current = storage;
    return storage;
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
