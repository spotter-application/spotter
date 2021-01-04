import { SpotterOption } from './interfaces';

export const spotterGenerateId = (): string => Math.random().toString(36).substr(2, 9);

export const spotterSearch = (query: string, options: SpotterOption[]): SpotterOption[] => {
  if (query === '' || !options?.length) {
    return [];
  }

  return options
    .filter((item: SpotterOption) => item.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.title.indexOf(query) - b.title.indexOf(query))
}
