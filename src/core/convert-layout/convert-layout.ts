import { ru } from './ru';

export const spotterConvertLayout = (query: string): string => {
  return query.split('').map(symbol => (ru[symbol] ?? symbol)).join('');
}
