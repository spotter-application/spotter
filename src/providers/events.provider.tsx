import { SpotterCommandType, SpotterCommand } from '@spotter-app/core';
import React, { FC, useEffect } from 'react';
import { SPOTTER_HOTKEY_IDENTIFIER } from '../constants';
import { SpotterHotkeyEvent } from '../interfaces';
import { useApi } from './api.provider';
import { useSettings } from './settings.provider';
import { hideOptions, getHistoryPath, sortOptions } from '../helpers';
import { useHistory } from './history.provider';
import { useSpotterState } from './state.provider';
import { usePlugins } from './plugins.provider';

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
    query,
    setQuery,
    options,
    setOptions,
    selectedOption,
    setSelectedOption,
    setLoading,
    hoveredOptionIndex,
    setHoveredOptionIndex,
    reset,
    registeredOptions,
    registeredPrefixes,
  } = useSpotterState();

  const { sendCommand } = usePlugins();

  useEffect(() => {
    registerHotkeys();
    checkDependencies();
  }, []);

  const registerHotkeys = async () => {
    const settings = await getSettings();
    hotkey.register(settings?.hotkey, SPOTTER_HOTKEY_IDENTIFIER);

    Object.entries(settings.pluginHotkeys).forEach(([plugin, options]) => {
      Object.entries(options).forEach(([option, shortcut]) => {
        hotkey.register(shortcut, `${plugin}#${option}`);
      });
    });

    hotkey.onPress(e => onPressHotkey(e));
  }

  const checkDependencies = async () => {
    const nodeInstalled = await shell.execute('node -v').catch(() => false);
    const foreverInstalled = await shell.execute('forever -v').catch(() => false);

    if (nodeInstalled) {
      if (!foreverInstalled) {
        await shell.execute('npm i -g forever');
      }
      return;
    }

    const brewInstalled = await shell.execute('brew -v').catch(() => false);
    if (!brewInstalled) {
      await shell.execute('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
    }

    await shell.execute('brew install node');
    await shell.execute('npm i -g forever');
  }

  const onPressHotkey = (e: SpotterHotkeyEvent) => {
    if (e.identifier === SPOTTER_HOTKEY_IDENTIFIER) {
      panel.open();
      return;
    };
  }

  const onEscape = () => {
    reset();
    panel.close();
  }

  const onBackspace = () => {
    if (selectedOption && !query.length) {
      reset();
    }
  }

  const onTab = async () => {
    const nextSelectedOption = options[hoveredOptionIndex];
    if (!nextSelectedOption || !nextSelectedOption.tabActionId) {
      return;
    }

    setSelectedOption(nextSelectedOption);
    setQuery('');

    const command: SpotterCommand = {
      type: SpotterCommandType.onAction,
      actionId: nextSelectedOption.tabActionId,
      query: '',
    };

    sendCommand(command, nextSelectedOption.plugin);
    increaseHistory(getHistoryPath(nextSelectedOption, null));
    setHoveredOptionIndex(0);
  }

  const onQuery = async (nextQuery: string) => {
    setQuery(nextQuery);

    if (nextQuery === '') {
      reset();
      return;
    }

    // Execute selected option tabAction
    if (selectedOption) {
      if (!selectedOption.tabActionId) {
        console.log('There is no tabActionId in selected option');
        return;
      }
      const command: SpotterCommand = {
        type: SpotterCommandType.onAction,
        actionId: selectedOption.tabActionId,
        query: nextQuery,
      };
      sendCommand(command, selectedOption.plugin);
      return;
    }

    // Check for matched prefixes
    const matchedPrefixes = registeredPrefixes.filter(
      p => nextQuery.startsWith(p.prefix),
    );

    if (matchedPrefixes.length) {
      matchedPrefixes.forEach(async p => {
        const command: SpotterCommand = {
          type: SpotterCommandType.onAction,
          query: nextQuery,
          actionId: p.actionId,
        };
        sendCommand(command, p.plugin);
      });
    }

    // Check for registered options
    const filteredRegisteredOptions = registeredOptions.filter(
      o => o.title.startsWith(nextQuery),
    );
    const history = await getHistory();
    const prioritizedOptions = hideOptions(filteredRegisteredOptions);
    const sortedOptions = sortOptions(
      prioritizedOptions ,
      selectedOption,
      history,
    );
    setOptions(sortedOptions);
  };

  const onArrowUp = () => {
    if (hoveredOptionIndex <= 0) {
      setHoveredOptionIndex(options.length - 1);
      return;
    }

    setHoveredOptionIndex(hoveredOptionIndex - 1)
  };

  const onArrowDown = () => {
    if (hoveredOptionIndex >= options.length - 1) {
      setHoveredOptionIndex(0);
      return;
    }

    setHoveredOptionIndex(hoveredOptionIndex + 1)
  };

  const onSubmit = async (index?: number) => {
    if (index || index === 0) {
      setHoveredOptionIndex(index);
    }

    const option = options[hoveredOptionIndex];

    if (!option) {
      return;
    }

    if (!option.actionId && option.tabActionId) {
      onTab();
      return;
    }

    if (!option.actionId) {
      return;
    }

    setLoading(true);

    const command: SpotterCommand = {
      type: SpotterCommandType.onAction,
      actionId: option.actionId,
      query,
    };

    sendCommand(command, option.plugin);
    increaseHistory(getHistoryPath(option, null));
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
