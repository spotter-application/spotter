import Mexp from 'math-expression-evaluator';
import { SpotterOption, SpotterPlugin, SpotterPluginLifecycle } from '../core/shared';

export class Calculator extends SpotterPlugin implements SpotterPluginLifecycle {

  onQuery(query: string): SpotterOption[] {
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
