import { SpotterCommandType, SpotterCommand, SpotterRegistryOption } from '@spotter-app/core';
import React, { FC, useEffect } from 'react';
import { ALT_QUERY_KEY_MAP, SPOTTER_HOTKEY_IDENTIFIER } from '../constants';
import { isPluginOnQueryOption, PluginRegistryOption, SpotterHotkeyEvent } from '../interfaces';
import { useApi } from './api.provider';
import { useSettings } from './settings.provider';
import { replaceOptions, getHistoryPath, sortOptions } from '../helpers';
import { useHistory } from './history.provider';
import { useSpotterState } from './state.provider';
import { usePlugins } from './plugins.provider';
import { combineLatest, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

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

      combineLatest([
        hoveredOptionIndex$,
        options$,
      ]).subscribe(([i, options]) => {
        const nextHoveredOption = options[i];
        if (!nextHoveredOption?.onHoverId) {
          return;
        }

        const command: SpotterCommand = {
          type: SpotterCommandType.onHover,
          onHoverId: nextHoveredOption.onHoverId,
        };
        sendCommand(command, nextHoveredOption.pluginName);
      })
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
    const selectedOption = selectedOption$.value;
    if (
      selectedOption &&
      isPluginOnQueryOption(selectedOption) &&
      selectedOption.onQueryCancelId
    ) {
      const command: SpotterCommand = {
        type: SpotterCommandType.onQueryCancel,
        onQueryCancelId: selectedOption.onQueryCancelId,
      };
      sendCommand(command, selectedOption$.value.pluginName);
    }

    resetState();
    panel.close();
  }

  const onBackspace = () => {
    const selectedOption = selectedOption$.value;
    if (selectedOption && !query$.value.length) {
      if (isPluginOnQueryOption(selectedOption) && selectedOption.onQueryCancelId) {
        const command: SpotterCommand = {
          type: SpotterCommandType.onQueryCancel,
          onQueryCancelId: selectedOption.onQueryCancelId,
        };
        sendCommand(command, selectedOption$.value.pluginName);
      }
      resetState();
    }
  }

  const onTab = async () => {
    const nextSelectedOption = options$.value[hoveredOptionIndex$.value];
    if (!nextSelectedOption || !nextSelectedOption.onQueryId) {
      return;
    }

    increaseHistory(getHistoryPath(nextSelectedOption, selectedOption$.value));

    selectedOption$.next(nextSelectedOption);
    query$.next('');
    options$.next([]);

    const command: SpotterCommand = {
      type: SpotterCommandType.onQuery,
      onQueryId: nextSelectedOption.onQueryId,
      query: '',
    };

    sendCommand(command, nextSelectedOption.pluginName);
    hoveredOptionIndex$.next(0);
  }

  const printHelpOptions = () => {
    const nextOptions: PluginRegistryOption[] = registeredOptions$.value
      .filter(o => o.prefix)
      .map(o => ({
        title: o.prefix ?? '',
        subtitle: o.title,
        icon: o.icon,
        pluginName: o.pluginName,
      }));

    options$.next(nextOptions);
  }

  const onQuery = async (nextQuery: string) => {
    query$.next(nextQuery);

    if (!selectedOption$.value && nextQuery === '') {
      resetState();
      return;
    }

    // Execute selected option tabAction
    if (selectedOption$.value) {
      if (!selectedOption$.value.onQueryId) {
        console.error('There is no onQueryId in selected option');
        return;
      }
      const command: SpotterCommand = {
        type: SpotterCommandType.onQuery,
        onQueryId: selectedOption$.value.onQueryId,
        query: nextQuery,
      };
      sendCommand(command, selectedOption$.value.pluginName);
      return;
    }
    

    // Help
    if (nextQuery === '?') {
      printHelpOptions();
      return;
    }

    // Check for matched prefixes
    const loweCaseQuery = nextQuery.toLowerCase();
    const matchedPrefixes = registeredOptions$.value.filter(
      p => p.prefix && loweCaseQuery.startsWith(`${p.prefix.toLowerCase()} `),
    );

    if (matchedPrefixes.length) {
      matchedPrefixes.forEach(async option => {
        if (!option.onQueryId) {
          return;
        }

        selectedOption$.next(option);
        query$.next('');

        const command: SpotterCommand = {
          type: SpotterCommandType.onQuery,
          query: '',
          onQueryId: option.onQueryId,
        };
        sendCommand(command, option.pluginName);
      });
    }

    // Check for registered options
    const filteredRegisteredOptions = registeredOptions$.value.filter(
      o => o.title
          .split(' ')
          .find(t => t.toLowerCase().startsWith(nextQuery.toLowerCase())),
    );

    const history = await getHistory();
    const prioritizedOptions = replaceOptions(filteredRegisteredOptions);
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
    const nextIndex = hoveredOptionIndex$.value <= 0
      ? options$.value.length - 1
      : hoveredOptionIndex$.value - 1;
    hoveredOptionIndex$.next(nextIndex);
  };

  const onArrowDown = () => {
    const nextIndex = hoveredOptionIndex$.value >= options$.value.length - 1
      ? 0
      : hoveredOptionIndex$.value + 1;
    hoveredOptionIndex$.next(nextIndex);
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

    if (!option.onSubmitId && option.onQueryId) {
      onTab();
      return;
    }

    if (!option.onSubmitId) {
      return;
    }

    // loading$.next(true);

    const command: SpotterCommand = {
      type: SpotterCommandType.onSubmit,
      onSubmitId: option.onSubmitId,
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
