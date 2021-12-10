import React, { FC } from 'react';
import { BehaviorSubject } from 'rxjs';
import { PluginOption, PluginPrefix } from '../interfaces';

type Context = {
  query$: BehaviorSubject<string>,
  altQuery$: BehaviorSubject<string>,
  placeholder$: BehaviorSubject<string | null>,
  options$: BehaviorSubject<PluginOption[]>,
  selectedOption$: BehaviorSubject<PluginOption | null>,
  loading$: BehaviorSubject<boolean>,
  hoveredOptionIndex$: BehaviorSubject<number>,
  waitingFor$: BehaviorSubject<string | null>,
  displayedOptionsForCurrentWorkflow$: BehaviorSubject<boolean>,
  registeredOptions$: BehaviorSubject<PluginOption[]>,
  registeredPrefixes$: BehaviorSubject<PluginPrefix[]>,
  resetState: () => void,
};

const context: Context = {
  query$: new BehaviorSubject<string>(''),
  altQuery$: new BehaviorSubject<string>(''),
  placeholder$: new BehaviorSubject<string | null>(null),
  options$: new BehaviorSubject<PluginOption[]>([]),
  selectedOption$: new BehaviorSubject<PluginOption | null>(null),
  loading$: new BehaviorSubject<boolean>(false),
  hoveredOptionIndex$: new BehaviorSubject<number>(0),
  waitingFor$: new BehaviorSubject<string | null>(null),
  displayedOptionsForCurrentWorkflow$: new BehaviorSubject<boolean>(false),
  registeredOptions$: new BehaviorSubject<PluginOption[]>([]),
  registeredPrefixes$: new BehaviorSubject<PluginPrefix[]>([]),
  resetState: () => null,
}

export const StateContext = React.createContext<Context>(context);

export const StateProvider: FC<{}> = (props) => {

  const resetState = () => {
    // context.query$.next('');
    // context.altQuery$.next('');
    context.placeholder$.next(null);
    context.options$.next([]);
    context.loading$.next(false);
    context.hoveredOptionIndex$.next(0);
    context.selectedOption$.next(null);
    context.waitingFor$.next(null);
    context.displayedOptionsForCurrentWorkflow$.next(false);
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
