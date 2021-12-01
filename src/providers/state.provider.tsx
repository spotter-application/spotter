import { PluginOption, PluginPrefix } from '@spotter-app/core';
import React, { FC, useState } from 'react';

type Context = {
  setQuery: (value: string) => void,
  setHint: React.Dispatch<React.SetStateAction<string | undefined>>;
  setLoading: (value: boolean) => void;
  setOptions: React.Dispatch<React.SetStateAction<PluginOption[]>>;
  setHoveredOptionIndex: (value: number) => void;
  setSelectedOption: (value: PluginOption | null) => void;
  setWaitingFor: (value: string | null) => void;
  query: string,
  hint?: string,
  options: PluginOption[],
  selectedOption: PluginOption | null,
  loading: boolean,
  hoveredOptionIndex: number,
  waitingFor: string | null,
  reset: () => void,
  registeredOptions: PluginOption[],
  setRegisteredOptions: React.Dispatch<React.SetStateAction<PluginOption[]>>;
  registeredPrefixes: PluginPrefix[],
  setRegisteredPrefixes: React.Dispatch<React.SetStateAction<PluginPrefix[]>>;
};

const context: Context = {
  setQuery: () => null,
  setHint: () => null,
  setLoading: () => null,
  setOptions: () => null,
  setHoveredOptionIndex: () => null,
  setSelectedOption: () => null,
  setWaitingFor: () => null,
  query: '',
  hint: '',
  options: [],
  selectedOption: null,
  loading: false,
  hoveredOptionIndex: 0,
  waitingFor: null,
  reset: () => null,
  registeredOptions: [],
  setRegisteredOptions: () => null,
  registeredPrefixes: [],
  setRegisteredPrefixes: () => null,
}

export const StateContext = React.createContext<Context>(context);

export const StateProvider: FC<{}> = (props) => {

  // State
  const [ query, setQuery ] = useState<string>('');
  const [ hint, setHint ] = useState<string>();
  const [ options, setOptions ] = useState<PluginOption[]>([]);
  const [ selectedOption, setSelectedOption] = useState<PluginOption | null>(null);
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ waitingFor, setWaitingFor ] = useState<string | null>(null);
  const [ hoveredOptionIndex, setHoveredOptionIndex ] = useState<number>(0);

  // Registries
  const [ registeredOptions, setRegisteredOptions ] = useState<PluginOption[]>([]);
  const [ registeredPrefixes, setRegisteredPrefixes ] = useState<PluginPrefix[]>([]);

  const reset = () => {
    setQuery('');
    setHint(undefined);
    setLoading(false);
    setOptions([]);
    setHoveredOptionIndex(0);
    setSelectedOption(null);
    setWaitingFor(null);
  }

  return (
    <StateContext.Provider value={{
      ...context,
      setQuery,
      setLoading,
      setOptions,
      setHoveredOptionIndex,
      setSelectedOption,
      setWaitingFor,
      query,
      options,
      hint,
      setHint,
      loading,
      hoveredOptionIndex,
      selectedOption,
      waitingFor,
      reset,
      registeredOptions,
      setRegisteredOptions,
      registeredPrefixes,
      setRegisteredPrefixes,
    }}>
      {props.children}
    </StateContext.Provider>
  );
};

export const useSpotterState = () => React.useContext(StateContext);
