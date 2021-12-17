import { Option } from '@spotter-app/core';
import React, { FC } from 'react';
import { BehaviorSubject } from 'rxjs';
import { PluginOnQueryOption, PluginRegistryOption } from '../interfaces';

type Context = {
  query$: BehaviorSubject<string>,
  placeholder$: BehaviorSubject<string | null>,
  options$: BehaviorSubject<Array<PluginRegistryOption | PluginOnQueryOption>>,
  selectedOption$: BehaviorSubject<PluginRegistryOption | PluginOnQueryOption | null>,
  loading$: BehaviorSubject<boolean>,
  hoveredOptionIndex$: BehaviorSubject<number>,
  registeredOptions$: BehaviorSubject<PluginRegistryOption[]>,
  systemOption$: BehaviorSubject<Option | null>,
  doing$: BehaviorSubject<string | null>,
  resetState: () => void,
};

const context: Context = {
  query$: new BehaviorSubject<string>(''),
  placeholder$: new BehaviorSubject<string | null>(null),
  options$: new BehaviorSubject<Array<PluginRegistryOption | PluginOnQueryOption>>([]),
  selectedOption$: new BehaviorSubject<PluginRegistryOption | PluginOnQueryOption | null>(null),
  loading$: new BehaviorSubject<boolean>(false),
  hoveredOptionIndex$: new BehaviorSubject<number>(0),
  registeredOptions$: new BehaviorSubject<PluginRegistryOption[]>([]),
  systemOption$: new BehaviorSubject<Option | null>(null),
  doing$: new BehaviorSubject<string | null>(null),
  resetState: () => null,
}

export const StateContext = React.createContext<Context>(context);

export const StateProvider: FC<{}> = (props) => {

  const resetState = () => {
    context.query$.next('');
    context.placeholder$.next(null);
    context.options$.next([]);
    context.hoveredOptionIndex$.next(0);
    context.selectedOption$.next(null);
  }

  return (
    <StateContext.Provider value={{
      ...context,
      resetState,
    }}>
      {props.children}
    </StateContext.Provider>
  );
};

export const useSpotterState = () => React.useContext(StateContext);
