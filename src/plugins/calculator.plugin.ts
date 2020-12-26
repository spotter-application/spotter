import { SpotterPlugin, SpotterOption } from '@spotter-app/core';
import Mexp from 'math-expression-evaluator';

export default class Calculator implements SpotterPlugin {

  query(query: string): SpotterOption[] {
    try {
      const result = Mexp.eval(query).toString();
      return result === query
        ? []
        : [{
            title: Mexp.eval(query).toString(),
            subtitle: '',
            image: '',
            action: () => null,
            shortKey: '',
          }];
    } catch {
      return []
    }
  }

}
