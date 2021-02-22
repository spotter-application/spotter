import { ru } from './ru';

const ignoreSymbols = ['/', '.', '*', ','];

export const spotterConvertLayout = (originalQuery: string): string => {
  return originalQuery.split('').map(symbol => (
    ignoreSymbols.find(s => s === symbol) ? symbol : (ru[symbol] ?? symbol)
  )).join('');
}

