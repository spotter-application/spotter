import React, { FC, useRef } from 'react';
import { useApi } from './api.provider';

const HISTORY_STORAGE_KEY = 'HISTORY';

export interface History {
  // [plugin:action#action]: counter
  [path: string]: number,
}

type Context = {
  getHistory: () => Promise<History>;
  increaseHistory: (path: string) => void;
};

const context: Context = {
  getHistory: () => Promise.resolve({}),
  increaseHistory: () => null,
}

export const HistoryContext = React.createContext<Context>(context);

export const HistoryProvider: FC<{}> = (props) => {

  const { storage } = useApi();

  const cachedHistory = useRef<History>();

  const getHistory = async () => {
    if (cachedHistory.current) {
      return cachedHistory.current;
    }

    const history = await storage.getItem<History>(HISTORY_STORAGE_KEY);
    if (!history) {
      return {};
    }

    cachedHistory.current = history;
    return history;
  }

  const increaseHistory = async (path: string) => {
    const history = await getHistory();
    const updatedHistory = {
      ...history,
      [path]: history[path] && typeof history[path] == 'number'
        ? history[path] + 1
        : 1,
    };

    cachedHistory.current = updatedHistory;
    storage.setItem(HISTORY_STORAGE_KEY, updatedHistory);
  }

  return (
    <HistoryContext.Provider value={{
      getHistory,
      increaseHistory,
    }}>
      {props.children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => React.useContext(HistoryContext);
