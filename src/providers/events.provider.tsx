import { SpotterCommandType, SpotterCommand } from '@spotter-app/core';
import React, { FC, useEffect } from 'react';
import { ALT_QUERY_KEY_MAP, SPOTTER_HOTKEY_IDENTIFIER } from '../constants';
import { SpotterHotkeyEvent } from '../interfaces';
import { useApi } from './api.provider';
import { useSettings } from './settings.provider';
import { hideOptions, getHistoryPath, sortOptions } from '../helpers';
import { useHistory } from './history.provider';
import { useSpotterState } from './state.provider';
import { usePlugins } from './plugins.provider';
import { Subscription, tap } from 'rxjs';

type Context = {
  onQuery: (query: string) => Promise<void>,
  onSubmit: (index?: number) => void,
  onArrowUp: () => void,
  onArrowDown: () => void,
  onEscape: () => void,
  onCommandComma: () => void,
  onTab: () => void,
  onBackspace: () => void,
};

const context: Context = {
  onQuery: () => Promise.resolve(),
  onSubmit: () => null,
  onArrowUp: () => null,
  onArrowDown: () => null,
  onEscape: () => null,
  onCommandComma: () => null,
  onTab: () => null,
  onBackspace: () => null,
}

export const EventsContext = React.createContext<Context>(context);

export const EventsProvider: FC<{}> = (props) => {
  const { panel, shell, hotkey } = useApi();
  const { getSettings } = useSettings();
  const { getHistory, increaseHistory } = useHistory();
  const {
    query$,
    altQuery$,
    options$,
    selectedOption$,
    loading$,
    hoveredOptionIndex$,
    registeredOptions$,
    registeredPrefixes$,
    displayedOptionsForCurrentWorkflow$,
    resetState,
  } = useSpotterState();
  const { sendCommand } = usePlugins();

  const subscriptions: Subscription[] = [];

  useEffect(() => {
    registerHotkeys();
    checkDependencies();

    subscriptions.push(
      altQuery$.pipe(
        tap(altQuery => {
          if (altQuery.length) {
            panel.open();
            onQuery(altQuery);
          };
        }),
      ).subscribe(),
    )
  }, []);

  useEffect(() => {
    return () => subscriptions.forEach(s => s.unsubscribe());
  }, []);

  const registerHotkeys = async () => {
    const settings = await getSettings();
    hotkey.register(settings?.hotkey, SPOTTER_HOTKEY_IDENTIFIER);

    Object.entries(settings.pluginHotkeys).forEach(([plugin, options]) => {
      Object.entries(options).forEach(([option, shortcut]) => {
        hotkey.register(shortcut, `${plugin}#${option}`);
      });
    });

    Object.entries(ALT_QUERY_KEY_MAP).forEach(([code, key]) => {
      hotkey.register(
        {doubledModifiers: false, keyCode: Number(code), modifiers: 2048},
        key,
      );
    });

    hotkey.onPress((e) => {
      onPressHotkey(e);
    });
  }

  const onPressHotkey = (e: SpotterHotkeyEvent) => {
    if (e.identifier === SPOTTER_HOTKEY_IDENTIFIER) {
      panel.open();
      return;
    };

    if (Object.values(ALT_QUERY_KEY_MAP).find(key => key === e.identifier)) {
      altQuery$.next(altQuery$.value + e.identifier);
      return;
    }
  }

  const checkDependencies = async () => {
    const nodeInstalled = await shell.execute('node -v').catch(() => false);

    if (nodeInstalled) {
      return;
    }

    const brewInstalled = await shell.execute('brew -v').catch(() => false);
    if (!brewInstalled) {
      await shell.execute('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
    }

    await shell.execute('brew install node');
  }

  const onEscape = () => {
    resetState();
    panel.close();
  }

  const onBackspace = () => {
    if (selectedOption$.value && !query$.value.length) {
      resetState();
    }
  }

  const onTab = async () => {
    const nextSelectedOption = options$.value[hoveredOptionIndex$.value];
    if (!nextSelectedOption || !nextSelectedOption.tabActionId) {
      return;
    }

    increaseHistory(getHistoryPath(nextSelectedOption, selectedOption$.value));

    selectedOption$.next(nextSelectedOption);
    query$.next('');
    options$.next([]);

    const command: SpotterCommand = {
      type: SpotterCommandType.onAction,
      actionId: nextSelectedOption.tabActionId,
      query: '',
    };

    sendCommand(command, nextSelectedOption.pluginName);
    hoveredOptionIndex$.next(0);
  }

  const onQuery = async (nextQuery: string) => {
    query$.next(nextQuery);

    if (nextQuery === '') {
      resetState();
      return;
    }

    // Execute selected option tabAction
    if (selectedOption$.value) {
      if (!selectedOption$.value.tabActionId) {
        console.error('There is no tabActionId in selected option');
        return;
      }
      const command: SpotterCommand = {
        type: SpotterCommandType.onAction,
        actionId: selectedOption$.value.tabActionId,
        query: nextQuery,
      };
      sendCommand(command, selectedOption$.value.pluginName);
      return;
    }

    // Check for matched prefixes
    const queryItems = nextQuery.toLowerCase().split(' ');
    const matchedPrefixes = queryItems.length > 1
      ? registeredPrefixes$.value.filter(
          p => queryItems[0] === p.prefix.toLowerCase(),
        )
      : [];

    if (matchedPrefixes.length) {
      matchedPrefixes.forEach(async p => {
        const command: SpotterCommand = {
          type: SpotterCommandType.onQuery,
          prefix: queryItems[0],
          query: nextQuery.replace(`${queryItems[0]} `, ''),
          onQueryId: p.onQueryId,
        };
        sendCommand(command, p.pluginName);
      });
    }

    // Check for registered options
    const filteredRegisteredOptions = registeredOptions$.value.filter(
      o => o.title
          .split(' ')
          .find(t => t.toLowerCase().startsWith(nextQuery.toLowerCase())),
    );

    const history = await getHistory();
    const prioritizedOptions = hideOptions(filteredRegisteredOptions);
    const sortedOptions = sortOptions(
      prioritizedOptions ,
      selectedOption$.value,
      history,
    );
    options$.next(sortedOptions);
    if (sortedOptions.length) {
      displayedOptionsForCurrentWorkflow$.next(true);
    }
  };

  const onArrowUp = () => {
    if (hoveredOptionIndex$.value <= 0) {
      hoveredOptionIndex$.next(options$.value.length - 1);
      return;
    }

    hoveredOptionIndex$.next(hoveredOptionIndex$.value - 1);
  };

  const onArrowDown = () => {
    if (hoveredOptionIndex$.value >= options$.value.length - 1) {
      hoveredOptionIndex$.next(0);
      return;
    }

    hoveredOptionIndex$.next(hoveredOptionIndex$.value + 1);
  };

  const onSubmit = async (index?: number) => {
    if (index || index === 0) {
      hoveredOptionIndex$.next(index);
    }

    const option = options$.value[hoveredOptionIndex$.value];

    if (!option) {
      panel.close();
      resetState();
      return;
    }

    if (!option.actionId && option.tabActionId) {
      onTab();
      return;
    }

    if (!option.actionId) {
      return;
    }

    loading$.next(true);

    const command: SpotterCommand = {
      type: SpotterCommandType.onAction,
      actionId: option.actionId,
      query: query$.value,
    };

    sendCommand(command, option.pluginName);
    increaseHistory(getHistoryPath(option, selectedOption$.value));
  }

  return (
    <EventsContext.Provider value={{
      ...context,
      onQuery,
      onEscape,
      onArrowUp,
      onArrowDown,
      onTab,
      onBackspace,
      onSubmit,
    }}>
      {props.children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => React.useContext(EventsContext);
