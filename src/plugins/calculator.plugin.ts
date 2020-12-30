import Mexp from 'math-expression-evaluator';
import { SpotterOption, SpotterPlugin, SpotterQuery } from '../core/shared';

export default class Calculator extends SpotterPlugin implements SpotterQuery {

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
          }];
    } catch {
      return []
    }
  }

}
