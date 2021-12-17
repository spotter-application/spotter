import { SpotterCommandType, SpotterCommand } from '@spotter-app/core';
import React, { FC, useEffect } from 'react';
import { PLUGINS_TO_INSTALL, SPOTTER_HOTKEY_IDENTIFIER } from '../constants';
import { isPluginOnQueryOption, PluginRegistryOption, SpotterHotkeyEvent } from '../interfaces';
import { useApi } from './api.provider';
import { useSettings } from './settings.provider';
import { replaceOptions, getHistoryPath, sortOptions, shouldUpgrade } from '../helpers';
import { useHistory } from './history.provider';
import { useSpotterState } from './state.provider';
import { usePlugins } from './plugins.provider';
import { combineLatest, Subscription } from 'rxjs';
import { Alert } from 'react-native';
import packageJson from '../../package.json';
import FS from 'react-native-fs';

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

type NextSpotterVersion = {
  name: string,
  bundleUrl: string,
} | null;

export const EventsContext = React.createContext<Context>(context);

export const EventsProvider: FC<{}> = (props) => {
  const { panel, shell, hotkey, notifications } = useApi();
  const { getSettings, patchSettings } = useSettings();
  const { getHistory, increaseHistory } = useHistory();
  const {
    query$,
    options$,
    selectedOption$,
    hoveredOptionIndex$,
    registeredOptions$,
    systemOption$,
    doing$,
    resetState,
  } = useSpotterState();
  const { sendCommand } = usePlugins();

  const subscriptions: Subscription[] = [];

  const nextSpotterVersion: {
    version: NextSpotterVersion,
    lastRequestedAt: number,
  } = { version: null, lastRequestedAt: 0 };

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

  const onCommandKey = async (key: number) => {
    if (key === 32) {
      if (!nextSpotterVersion.version) {
        doing$.next('Checking for a new version...');
        await requestLastSpotterOption(true);
        setTimeout(() => doing$.next(null), 1000);
      }

      if (!nextSpotterVersion.version) {
        return;
      }

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

    hotkey.onPress((e) => {
      onPressHotkey(e);
    });
  }

  const checkLatestVersion = async (
    now: number,
    lastRequestedAt: number
  ): Promise<NextSpotterVersion> => {
    if ((now - lastRequestedAt) < FIVE_MIN) {
      return null;
    }

    const latestVersion = await fetch(
      'https://api.github.com/repos/ziulev/spotter/releases/latest'
    ).then(r => r.json());

    if (!shouldUpgrade(packageJson.version, latestVersion.name)) {
      return null;
    }

    const bundle = latestVersion.assets.find((a: {name: string}) => a.name === 'spotter.dmg');
    return {
      name: latestVersion.name,
      bundleUrl: bundle.browser_download_url,
    };
  }

  const upgradeSpotter = async (buildUrl?: string) => {
    if (!buildUrl) {
      return;
    }

    const isDev = FS.MainBundlePath.includes('Xcode/DerivedData');
    if (isDev) {
      notifications.show('Can not update dev version', 'It looks like you are cheating 🙂') ;
      return;
    }

    systemOption$.next(null);
    doing$.next('Upgrading spotter...');

    await shell.execute(`cd ~ && rm spotter.dmg || true`);
    await shell.execute(`cd ~ && curl -L ${buildUrl} > spotter.dmg`);
    const volume = (await shell.execute(`cd ~ && hdiutil attach -nobrowse spotter.dmg | awk 'END {$1=$2=""; print $0}'; exit \${PIPESTATUS[0]}`)).trimStart();
    await shell.execute(`cp -r "${volume}/spotter.app/Contents/MacOS/spotter" "${FS.MainBundlePath}/Contents/MacOS/spotter"`);
    await shell.execute(`cp -r "${volume}/spotter.app/Contents/Resources/main.jsbundle" "${FS.MainBundlePath}/Contents/Resources/main.jsbundle"`);
    await shell.execute(`hdiutil unmount '${volume}'`);
    await shell.execute(`osascript -e 'quit app "Spotter"' && open "${FS.MainBundlePath}"`);

    doing$.next(null);
  }

  const onPressHotkey = async (e: SpotterHotkeyEvent) => {
    if (e.identifier === SPOTTER_HOTKEY_IDENTIFIER) {
      requestLastSpotterOption();
      panel.open();
      return;
    };
  }

  const requestLastSpotterOption = async (force?: boolean) => {
    const now = new Date().getTime();
    nextSpotterVersion.version = await checkLatestVersion(
      now,
      force ? 0 : nextSpotterVersion.lastRequestedAt,
    );
    if (!nextSpotterVersion.version) {
      return;
    }

    systemOption$.next({
      title: 'Upgrade Spotter',
      subtitle: nextSpotterVersion.version?.name,
      onSubmit: () => upgradeSpotter(nextSpotterVersion.version?.bundleUrl),
    });
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
    const prefixes: PluginRegistryOption[] = registeredOptions$.value
      .filter(o => o.prefix)
      .map(o => ({
        title: o.prefix ? `[Prefix] ${o.prefix}` : '',
        subtitle: o.title,
        icon: o.icon,
        pluginName: o.pluginName,
      }));
    
    const hotkeys: PluginRegistryOption[] = [
      { title: '[Hotkey] cmd + u', icon: '⬆️', subtitle: 'Check for a new version', pluginName: '' }
    ];

    options$.next([
      ...prefixes,
      ...hotkeys,
    ]);
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

    if (nextQuery === '-v') {
      options$.next([{
        title: packageJson.version,
        pluginName: '',
      }]);
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
