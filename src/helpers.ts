import { PluginOption } from '@spotter-app/core';
import { History } from './providers';

export const getHistoryPath = (
  option: PluginOption,
  selectedOption: PluginOption | null,
): string => {
  const path = selectedOption
    ? `${option.plugin}:${selectedOption.title}#${option.title}`
    : `${option.plugin}:${option.title}`;

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

  return options.filter(o => !optionsToHide.includes(o.title));
};
