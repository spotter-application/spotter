import { evaluate, format } from 'mathjs';
import { Plugin } from '@spotter-app/plugin';
import { exec } from 'node:child_process';
import packageJSON from '../package.json';

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
    super({
      name: packageJSON.name,
      icon: '/System/Applications/Calculator.app',
      version: packageJSON.version,
    });
  }

  onInit() {
    this.spotter.setRegisteredOptions([{
      title: 'Calculator',
      prefix: 'clc',
      icon: this.calculatorPath,
      replaceOptions: ['Calculator'],
      onSubmit: this.open,
      onQuery: this.calculate,
    }]);
  }

  open() {
    exec(`open "${this.calculatorPath}"`);
  }

  calculate(query: string) {
    const hasOperator = OPERATORS.find(o => query.indexOf(o) !== -1);

    if (!hasOperator) {
      return [];
    }

    const execution = query.replaceAll('=', '');

    let result: string | null;
    try {
      result = format(evaluate(execution), {precision: 14});
    } catch {
      result = null;
    }

    if (!result) {
      return [];
    }

    if (query.endsWith('=')) {
      this.spotter.setQuery(result);
      return [];
    }

    return [{
      title: result,
      icon: this.calculatorPath,
    }];
  }
}
