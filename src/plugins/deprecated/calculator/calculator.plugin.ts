import { evaluate, format } from 'mathjs';
import { SpotterOption, InternalPlugin, InternalPluginLifecycle } from '../../../core';
import icon from './icon.png';

export class CalculatorPlugin extends InternalPlugin implements InternalPluginLifecycle {

  identifier = 'Calculator';

  async onQuery(query: string): Promise<SpotterOption[]> {
    const normalizedQuery = query.replaceAll('=', '');
    const isMathExpression = (/(?:[0-9-+*/^()x]|abs|e\^x|ln|log|a?(?:sin|cos|tan)h?)+/).test(normalizedQuery);
    const hasRequiredSymbols = normalizedQuery.split('').find(q => ['+', '-', '*', '/', 'sin', 'cos', 'tan'].find(s => s === q));

    if (!isMathExpression || !hasRequiredSymbols) {
      return [];
    }

    try {
      const result: string = format(evaluate(normalizedQuery), {precision: 14})

      if (!result) {
        return [];
      }

      if (query.endsWith('=')) {
        this.api.query.value = result;
        return [];
      }

      return [{
        title: result,
        subtitle: 'Copy to clipboard',
        icon,
        action: () => this.copyToClipboard(result),
      }];
    } catch (_) {
      return [];
    }
  }

  private copyToClipboard(value: string) {
    this.api.clipboard.setValue(value);
  }

}

