import {
  ChannelEventType,
  ChannelForPlugin,
  ChannelForSpotter,
  Option,
  SpotterPlugin,
} from '@spotter-app/core';
import { PluginOption } from './interfaces';
import { INTERNAL_PLUGINS } from './plugins';
import { History } from './providers';

export const getHistoryPath = (
  option: PluginOption,
  selectedOption: PluginOption | null,
): string => {
  const path = selectedOption
    ? `${option.pluginName}:${selectedOption.title}#${option.title}`
    : `${option.pluginName}:${option.title}`;

  return path;
};

export const sortOptions = (
  options: PluginOption[],
  selectedOption: PluginOption | null,
  history: History,
): PluginOption[] => {
  return options.sort((a, b) => {
    return (history[getHistoryPath(b, selectedOption)] ?? 0) -
      (history[getHistoryPath(a, selectedOption)] ?? 0);
  });
};

export const hideOptions = (options: PluginOption[]): PluginOption[] => {
  const optionsToHide: string[] = options.reduce<string[]>((acc, curr) => {
    return [...acc, ...(curr?.hideOptions ? curr.hideOptions : [])];
  }, []);

  if (!optionsToHide.length) {
    return options;
  }

  return options.filter(o => {
    const optionToHide = optionsToHide.find(opt => opt === o.title);
    const shouldHide = optionToHide && !o.hideOptions?.find(opt => opt === optionToHide);
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
