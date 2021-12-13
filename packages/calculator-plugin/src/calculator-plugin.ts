import { evaluate, format } from 'mathjs';
import { Plugin } from '@spotter-app/plugin';

const PREFIXES = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'sin',
  'cos',
  'tan',
];

const OPERATORS = [
  '+',
  '-',
  '*',
  '/',
  'sin',
  'cos',
  'tan',
];

new class CalculatorPlugin extends Plugin {
  private calculatorPath = '/System/Applications/Calculator.app';

  constructor() {
    super('calculator-plugin');
  }

  onInit() {
    // TODO: check
    // this.spotter.setRegisteredPrefixes(PREFIXES.map(prefix => ({
    //   prefix,
    //   onQuery: this.calculate,
    // })));
  }

  calculate(query: string) {
    const hasOperator = OPERATORS.find(o => query.indexOf(o) !== -1);

    if (!hasOperator) {
      return;
    }

    const execution = query.replaceAll('=', '');

    let result: string | null;
    try {
      result = format(evaluate(execution), {precision: 14});
    } catch {
      result = null;
    }

    if (!result) {
      return;
    }

    if (query.endsWith('=')) {
      this.spotter.setQuery(result);
      return;
    }

    return [{
      title: result,
      icon: this.calculatorPath,
    }];
  }
}
