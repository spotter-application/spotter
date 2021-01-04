import Mexp from 'math-expression-evaluator';
import { SpotterOption, SpotterPlugin, SpotterPluginLifecycle } from '../core';

export class CalculatorPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  onQuery(query: string): SpotterOption[] {
    const isMathExpression = (/(?:[0-9-+*/^()x]|abs|e\^x|ln|log|a?(?:sin|cos|tan)h?)+/).test(query);

    if (!isMathExpression) {
      return [];
    }

    try {
      const result = Mexp.eval(query).toString();

      if (!result || result === query) {
        return [];
      }

      return [{
        title: result,
        subtitle: `Copy to ${result} clipboard`,
        image: '',
        action: () => this.copyToClipboard(result),
      }];
    } catch (_) {
      return [];
    }
  }

  private copyToClipboard(value: string) {
    this.nativeModules.clipboard.setValue(value);
  }

}
