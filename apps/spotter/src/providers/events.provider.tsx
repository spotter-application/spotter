import { SpotterCommandType, SpotterCommand } from '@spotter-app/core';
import React, { FC, useEffect } from 'react';
import { ALT_QUERY_KEY_MAP, PLUGINS_TO_INSTALL, SPOTTER_HOTKEY_IDENTIFIER } from '../constants';
import { isPluginOnQueryOption, PluginRegistryOption, SpotterHotkeyEvent } from '../interfaces';
import { useApi } from './api.provider';
import { useSettings } from './settings.provider';
import { replaceOptions, getHistoryPath, sortOptions, shouldUpgrade } from '../helpers';
import { useHistory } from './history.provider';
import { useSpotterState } from './state.provider';
import { usePlugins } from './plugins.provider';
import { combineLatest, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Alert } from 'react-native';
import packageJson from '../../package.json';

const FIVE_MIN = 5 * 60 * 1000;

type Context = {
  onQuery: (query: string) => Promise<void>,
  onSubmit: (index?: number) => void,
  onArrowUp: () => void,
  onArrowDown: () => void,
  onEscape: () => void,
  onCommandKey: (key: number) => void,
  onTab: () => void,
  onBackspace: () => void,
};

const context: Context = {
  onQuery: () => Promise.resolve(),
  onSubmit: () => null,
  onArrowUp: () => null,
  onArrowDown: () => null,
  onEscape: () => null,
  onCommandKey: () => null,
  onTab: () => null,
  onBackspace: () => null,
}

export const EventsContext = React.createContext<Context>(context);

export const EventsProvider: FC<{}> = (props) => {
  const { panel, shell, hotkey, notifications } = useApi();
  const { getSettings, patchSettings } = useSettings();
  const { getHistory, increaseHistory } = useHistory();
  const {
    query$,
    altQuery$,
    options$,
    selectedOption$,
    hoveredOptionIndex$,
    registeredOptions$,
    displayedOptionsForCurrentWorkflow$,
    systemOption$,
    doing$,
    resetState,
  } = useSpotterState();
  const { sendCommand } = usePlugins();

  const subscriptions: Subscription[] = [];

  const nextSpotterVersion: {
    version: {
      name: string,
      bundleUrl: string,
    } | null,
    requestedAt: number,
  } = { version: null, requestedAt: 0 };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    return () => subscriptions.forEach(s => s.unsubscribe());
  }, []);

  const init = async () => {
    await registerHotkeys();

    const settings = await getSettings();
    if (!settings.pluginsPreinstalled) {
      doing$.next('Installing dependencies...');
      await checkDependencies();
      doing$.next('Installing plugins...');
      await installPlugins();
      doing$.next(null);
      patchSettings({pluginsPreinstalled: true});
    }

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
    );
  }

  const onCommandKey = (key: number) => {
    if (key === 32) {
      upgradeSpotter(nextSpotterVersion.version?.bundleUrl);
      return;
    }
  }

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

  const checkLatestVersion = async () => {
    // const isDev = FS.MainBundlePath.includes('Xcode/DerivedData');
    // if (isDev) {
    //   return;
    // }

    const now = new Date().getTime();
    if (
      !nextSpotterVersion.version &&
      (now - nextSpotterVersion.requestedAt) > FIVE_MIN
    ) {
      const latestVersion = await fetch(
        'https://api.github.com/repos/ziulev/spotter/releases/latest'
      ).then(r => r.json());

      nextSpotterVersion.requestedAt = now;

      if (!shouldUpgrade(packageJson.version, latestVersion.name)) {
        return;
      }

      const bundle = latestVersion.assets.find((a: {name: string}) => a.name === 'spotter.dmg');
      nextSpotterVersion.version = {
        name: latestVersion.name,
        bundleUrl: bundle.browser_download_url,
      };
    }

    if (!nextSpotterVersion.version) {
      return;
    }

    systemOption$.next({
      title: 'Upgrade Spotter',
      subtitle: nextSpotterVersion.version?.name,
      onSubmit: () => upgradeSpotter(nextSpotterVersion.version?.bundleUrl),
    });
  }

  const upgradeSpotter = async (buildUrl?: string) => {
    if (!buildUrl) {
      return;
    }

    systemOption$.next(null);
    doing$.next('Upgrading spotter...');
    await shell.execute(`cd ~ && rm spotter.dmg || true`);
    await shell.execute(`cd ~ && curl -L ${buildUrl} > spotter.dmg`);
    await shell.execute('cd ~ && hdiutil attach -nobrowse spotter.dmg')
    await shell.execute(`cp -r /Volumes/Spotter/spotter.app /Applications`);
    await shell.execute(`hdiutil unmount '/Volumes/Spotter'`);
    doing$.next(null);
    shell.execute(`osascript -e 'quit app "Spotter"' && osascript -e 'activate app "Spotter"'`);
  }

  const onPressHotkey = (e: SpotterHotkeyEvent) => {
    if (e.identifier === SPOTTER_HOTKEY_IDENTIFIER) {
      checkLatestVersion();
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

  const installPlugins = async () => {
    return await Promise.all(PLUGINS_TO_INSTALL.map(async plugin => {
      try {
        await shell.execute(`npm uninstall -g ${plugin}`);
        await shell.execute(`npm i -g ${plugin}`);
      } catch (e) {
        Alert.alert(`${e}`);
      }
    }));
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

  const onQueryForSelectedOption = async (nextQuery: string) => {
    if (!selectedOption$.value || !selectedOption$.value.onQueryId) {
      return;
    }

    const command: SpotterCommand = {
      type: SpotterCommandType.onQuery,
      onQueryId: selectedOption$.value.onQueryId,
      query: nextQuery,
    };

    sendCommand(command, selectedOption$.value.pluginName);
  }

  // TODO: remove
  const onQueryForOptionsWithPrefixes = async (nextQuery: string) => {
    const loweCaseQuery = nextQuery.toLowerCase();
    const matchedPrefixes = registeredOptions$.value.filter(
      p => p.prefix && loweCaseQuery.startsWith(`${p.prefix.toLowerCase()} `),
    );

    if (!matchedPrefixes.length) {
      return;
    }

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

  const onQueryForRegisteredOptions = async (nextQuery: string) => {
    const filteredRegisteredOptions = registeredOptions$.value.filter(
      o =>
        o.prefix?.toLowerCase().startsWith(nextQuery.toLowerCase()) ||
        o.title
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
  }

  const onQuery = async (nextQuery: string) => {
    query$.next(nextQuery);

    if (!selectedOption$.value && nextQuery === '') {
      resetState();
      return;
    }

    // Help
    if (nextQuery === '?') {
      printHelpOptions();
      return;
    }

    onQueryForSelectedOption(nextQuery);

    onQueryForOptionsWithPrefixes(nextQuery);
    
    onQueryForRegisteredOptions(nextQuery);
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
      onCommandKey,
    }}>
      {props.children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => React.useContext(EventsContext);
