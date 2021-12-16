import {
  ChannelEventType,
  ChannelForPlugin,
  ChannelForSpotter,
  Option,
  SpotterPlugin,
} from '@spotter-app/core';
import { INTERNAL_PLUGINS } from './constants';
import { PluginOnQueryOption, PluginRegistryOption, SpotterThemeColors } from './interfaces';
import { History } from './providers';

export const getHistoryPath = (
  option: PluginRegistryOption | PluginOnQueryOption,
  selectedOption: PluginRegistryOption | PluginOnQueryOption | null,
): string => {
  const path = selectedOption
    ? `${option.pluginName}:${selectedOption.title}#${option.title}`
    : `${option.pluginName}:${option.title}`;

  return path;
};

export const sortOptions = (
  options: Array<PluginRegistryOption | PluginOnQueryOption>,
  selectedOption: PluginRegistryOption | PluginOnQueryOption | null,
  history: History,
): Array<PluginRegistryOption | PluginOnQueryOption> => {
  return options.sort((a, b) => {
    return (history[getHistoryPath(b, selectedOption)] ?? 0) -
      (history[getHistoryPath(a, selectedOption)] ?? 0);
  });
};

export const replaceOptions = (
  options: Array<PluginRegistryOption | PluginOnQueryOption>
): Array<PluginRegistryOption | PluginOnQueryOption> => {
  const optionsToHide: string[] = options.reduce<string[]>((acc, curr) => {
    return [...acc, ...(curr?.replaceOptions ? curr.replaceOptions : [])];
  }, []);

  if (!optionsToHide.length) {
    return options;
  }

  return options.filter(o => {
    const optionToHide = optionsToHide.find(opt => opt === o.title);
    const shouldHide = optionToHide && !o.replaceOptions?.find(opt => opt === optionToHide);
    return !shouldHide;
  });
};

export class ExternalPluginChannel implements ChannelForSpotter {
  private ws: WebSocket;

  constructor(port: number) {
    this.ws = new WebSocket(`ws://127.0.0.1:${port}`);
  }

  sendToPlugin(data: string) {
    this.ws.send(data);
  }

  onPlugin(
    eventType: ChannelEventType,
    callback: (data: string) => void
  ) {
    if (eventType === 'open') {
      this.ws.onopen = () => callback('');
      return;
    }

    if (eventType === 'close') {
      this.ws.onclose = () => callback('');
      return;
    }

    if (eventType === 'message') {
      this.ws.onmessage = ({ data }) => callback(data);
      return;
    }

    if (eventType === 'error') {
      this.ws.onerror = ({ message }) => callback(message);
      return;
    }
  }

  close() {
    this.ws.close();
  }
}

export class InternalPluginChannel implements ChannelForPlugin, ChannelForSpotter {
  plugin: SpotterPlugin;

  constructor(internalPluginName: string) {
    const channel = Promise.resolve(this);
    this.plugin = new INTERNAL_PLUGINS[internalPluginName](channel);
    setTimeout(() => this.triggerOnPluginOpen(''), 500);
  }

  triggerOnPluginOpen(_: string) {}

  triggerOnPluginClose(_: string) {}

  triggerOnPluginMessage(_: string) {}

  triggerOnPluginError(_: string) {}

  triggerOnSpotterMessage(_: string) {}

  onPlugin(
    eventType: ChannelEventType,
    callback: (data: string) => void
  ) {
    if (eventType === 'open') {
      this.triggerOnPluginOpen = callback;
      return;
    }

    if (eventType === 'close') {
      this.triggerOnPluginClose = callback;
      return;
    }

    if (eventType === 'message') {
      this.triggerOnPluginMessage = callback;
      return;
    }

    if (eventType === 'error') {
      this.triggerOnPluginError = callback;
      return;
    }
  }

  onSpotter(
    eventType: ChannelEventType,
    callback: (data: string) => void,
  ) {
    if (eventType === 'message') {
      this.triggerOnSpotterMessage = callback
      return;
    }
  }

  sendToSpotter(data: string) {
    this.triggerOnPluginMessage(data);
  }

  sendToPlugin(data: string) {
    this.triggerOnSpotterMessage(data);
  }

  close() {}
}

export const getHint = (query: string, option: Option) => {
  if (!query || !option) {
    return;
  }

  const queryIndex = option.title
    .toLowerCase()
    .lastIndexOf(query.toLowerCase());

  return option.title.slice(queryIndex).split('').reduce(
    (acc, curr, index) => {
      const nextSymbol = query[index] ?? curr;
      return `${acc}${nextSymbol}`;
    },
    '',
  );
}

export const parseTheme = (value: string): SpotterThemeColors => {
  const colors = value.split(',');

  return {
    background: colors[0],
    text: colors[1],
    activeOptionBackground: colors[2],
    activeOptionText: colors[3],
    hoveredOptionBackground: colors[4],
    hoveredOptionText: colors[5],
  }
};

const versionToNumber = (version: string): number => {
  const values = version.replaceAll('.', '').split('-beta')
  return Number(
    values.length === 2
    ? values[0] + (values[1].length === 1 ? `0${values[1]}` : values[1])
    : values[0]
  );
}

// 0.0.1-beta.1 < 0.0.1-beta.2
export const shouldUpgrade = (
  current: string,
  nextVersion: string,
): boolean => {
  const currentNumber = versionToNumber(current);
  const nextVersionNumber = versionToNumber(nextVersion);

  return currentNumber < nextVersionNumber;
}
