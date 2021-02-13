import { SpotterOptionBase, SpotterPlugin, SpotterPluginLifecycle } from '../../core';
import icon from './icon.png';

export class CalculatorPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  identifier = 'Calculator';

  async onQuery(query: string): Promise<SpotterOptionBase[]> {
    const normalizedQuery = query.replaceAll('|', '/');
    const isMathExpression = (/(?:[0-9-+*/^()x]|abs|e\^x|ln|log|a?(?:sin|cos|tan)h?)+/).test(normalizedQuery);
    const hasRequiredSymbols = normalizedQuery.split('').find(q => ['+', '-', '*', '/', 'sin', 'cos', 'tan'].find(s => s === q));

    if (!isMathExpression || !hasRequiredSymbols) {
      return [];
    }

    try {
      const result = eval(normalizedQuery).toString();

      if (!result) {
        return [];
      }

      return [{
        title: result,
        subtitle: `Copy to ${result} clipboard`,
        icon,
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
