import Mexp from 'math-expression-evaluator';
import { SpotterPlugin, SpotterPluginLifecycle } from '../core/shared';

export class Calculator extends SpotterPlugin implements SpotterPluginLifecycle {

  onQuery(query: string) {
    try {
      const result = Mexp.eval(query).toString();
      const options = result === query
        ? []
        : [{
            title: Mexp.eval(query).toString(),
            subtitle: '',
            image: '',
            action: () => null,
          }];
      this.setOptions(options);
    } catch { }
  }

}
