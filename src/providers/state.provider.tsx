import React, { FC, useState } from 'react';
import {
  ExternalPluginOption,
  InternalPluginOption,
  Options,
  RegisteredOptions,
  RegisteredPrefixes,
} from '../core/interfaces';

type Context = {
  setQuery: (value: string) => void,
  setHint: (value: string | null) => void;
  setLoading: (value: boolean) => void;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
  setHoveredOptionIndex: (value: number) => void;
  setSelectedOption: (value: ExternalPluginOption | InternalPluginOption | null) => void;
  setWaitingFor: (value: string | null) => void;
  query: string,
  hint?: string,
  options: Array<InternalPluginOption | ExternalPluginOption>,
  selectedOption: InternalPluginOption | ExternalPluginOption | null,
  loading: boolean,
  hoveredOptionIndex: number,
  waitingFor: string | null,
  reset: () => void,
  registeredOptions: RegisteredOptions,
  setRegisteredOptions: React.Dispatch<React.SetStateAction<RegisteredOptions>>;
  registeredPrefixes: RegisteredPrefixes,
  setRegisteredPrefixes: React.Dispatch<React.SetStateAction<RegisteredPrefixes>>;
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
  registeredOptions: {},
  setRegisteredOptions: () => null,
  registeredPrefixes: {},
  setRegisteredPrefixes: () => null,
}

export const StateContext = React.createContext<Context>(context);

export const StateProvider: FC<{}> = (props) => {

  // State
  const [ query, setQuery ] = useState<string>('');
  const [ hint, setHint ] = useState<string>();
  const [ options, setOptions ] = useState<Options>([]);
  const [ selectedOption, setSelectedOption] = useState<ExternalPluginOption | InternalPluginOption | null>(null);
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ waitingFor, setWaitingFor ] = useState<string | null>(null);
  const [ hoveredOptionIndex, setHoveredOptionIndex ] = useState<number>(0);

  // Registry
  const [ registeredOptions, setRegisteredOptions ] = useState<RegisteredOptions>({});
  const [ registeredPrefixes, setRegisteredPrefixes ] = useState<RegisteredPrefixes>({});

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

