import { SpotterOption } from './core';

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const search = (query: string, options: SpotterOption[]): SpotterOption[] => {
  if (query === '' || !options?.length) {
    return [];
  }

  return options
    .filter((item: SpotterOption) => item.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.title.indexOf(query) - b.title.indexOf(query))
}
