import { evaluate } from 'mathjs';
import { SpotterOption, SpotterPlugin, SpotterPluginLifecycle } from '../../core';
import icon from './icon.png';

export class CalculatorPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  identifier = 'Calculator';

  async onQuery(query: string): Promise<SpotterOption[]> {
    const normalizedQuery = query.replaceAll('=', '');
    const isMathExpression = (/(?:[0-9-+*/^()x]|abs|e\^x|ln|log|a?(?:sin|cos|tan)h?)+/).test(normalizedQuery);
    const hasRequiredSymbols = normalizedQuery.split('').find(q => ['+', '-', '*', '/', 'sin', 'cos', 'tan'].find(s => s === q));

    if (!isMathExpression || !hasRequiredSymbols) {
      return [];
    }

    try {
      const result: number = evaluate(normalizedQuery);

      if (!result && result !== 0) {
        return [];
      }

      if (query.endsWith('=')) {
        this.api.queryInput.setValue(`${result}`);
        return [];
      }

      return [{
        title: `${result}`,
        subtitle: 'Copy to clipboard',
        icon,
        action: () => this.copyToClipboard(`${result}`),
      }];
    } catch (_) {
      return [];
    }
  }

  private copyToClipboard(value: string) {
    this.api.clipboard.setValue(value);
  }

}

