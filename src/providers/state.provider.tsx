import React, { FC, useState } from 'react';
import {
  ExternalPluginOption,
  InternalPluginOption,
  Options,
} from '../core/interfaces';

type Context = {
  setQuery: (value: string) => void,
  setHint: (value: string | null) => void;
  setLoading: (value: boolean) => void;
  setOptions: (value: Options) => void;
  setHoveredOptionIndex: (value: number) => void;
  setSelectedOption: (value: ExternalPluginOption | InternalPluginOption | null) => void;
  setWaitingFor: (value: string | null) => void;
  setShouldShowOptions: React.Dispatch<React.SetStateAction<boolean>>;
  query: string,
  hint?: string,
  options: Array<InternalPluginOption | ExternalPluginOption>,
  selectedOption: InternalPluginOption | ExternalPluginOption | null,
  loading: boolean,
  hoveredOptionIndex: number,
  shouldShowOptions: boolean,
  waitingFor: string | null,
  reset: () => void,
};

const context: Context = {
  setQuery: () => null,
  setHint: () => null,
  setLoading: () => null,
  setOptions: () => null,
  setHoveredOptionIndex: () => null,
  setSelectedOption: () => null,
  setWaitingFor: () => null,
  setShouldShowOptions: () => null,
  query: '',
  hint: '',
  options: [],
  selectedOption: null,
  loading: false,
  hoveredOptionIndex: 0,
  shouldShowOptions: false,
  waitingFor: null,
  reset: () => null,
}

export const StateContext = React.createContext<Context>(context);

export const StateProvider: FC<{}> = (props) => {

  const [ query, setQuery ] = useState<string>('');
  const [ hint, setHint ] = useState<string>();
  const [ options, setOptions ] = useState<Options>([]);
  const [ selectedOption, setSelectedOption] = useState<ExternalPluginOption | InternalPluginOption | null>(null);
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ waitingFor, setWaitingFor ] = useState<string | null>(null);
  const [ hoveredOptionIndex, setHoveredOptionIndex ] = useState<number>(0);

  const [ shouldShowOptions, setShouldShowOptions ] = useState<boolean>(false);

  const reset = () => {
    setQuery('');
    setHint(undefined);
    setLoading(false);
    setOptions([]);
    setHoveredOptionIndex(0);
    setSelectedOption(null);
    setWaitingFor(null);
    setShouldShowOptions(false);
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
      setShouldShowOptions,
      query,
      options,
      hint,
      loading,
      hoveredOptionIndex,
      shouldShowOptions,
      selectedOption,
      waitingFor,
      reset,
    }}>
      {props.children}
    </StateContext.Provider>
  );
};

export const useSpotterState = () => React.useContext(StateContext);

