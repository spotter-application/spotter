import { SpotterOption, SpotterPlugin, SpotterPluginLifecycle } from '../../core';
import data from './currencies.json';

interface Currency {
  currencyCode: string,
  currencyNameEn: string,
  flag: string,
}

const DEFAULT_CURRENCIES = [
  'USD',
  'CHF',
  'KYD',
  'EUR',
  'GIP',
  'GBP',
  'JOD',
  'OMR',
  'BHD',
  'KWD',
];

const CURRENCIES_TO_HISTORY = 'CURRENCIES_TO_HISTORY';

export class CurrencyConverter extends SpotterPlugin implements SpotterPluginLifecycle {

  public identifier = 'Currency Converter';

  private currencies: Currency[] = data.currencies;
  private currenciesToHistory: string[] | null = null;
  private currencySuggestions: Currency[] = [];

  async onOpenSpotter() {
    this.currenciesToHistory = await this.api.storage.getItem(CURRENCIES_TO_HISTORY);
    this.currencySuggestions = this.currencies.filter(c =>
      this.currenciesToHistory
        ? this.currenciesToHistory.find(d => d === c.currencyCode)
        : DEFAULT_CURRENCIES.find(d => d === c.currencyCode)
    );
  }

  async onQuery(query: string): Promise<SpotterOption[]> {
    if (!query.length) {
      return [];
    }

    // const currencies = data.currencies;
    const uppercaseQuery = query.toUpperCase();
    const [firstCurrency, secondCurrency] = this.currencies.filter(c =>
      uppercaseQuery.includes(c.currencyCode)
    );

    if (!firstCurrency && !secondCurrency) {
      return [];
    }

    const queryNumberMatch = uppercaseQuery.match(/\d+/);
    const amount = queryNumberMatch ? queryNumberMatch[0] : '1';

    if (!firstCurrency || !secondCurrency) {
      const currencyFrom = firstCurrency ?? secondCurrency;
      const suggestCurrencies = this.currencySuggestions.filter(c => c.currencyCode !== currencyFrom.currencyCode);
      console.log('defaultCurrencies: ', this.currencySuggestions);
      return await Promise.all(suggestCurrencies.map(async suggestCurrencyTo => {
        const result = await this.convert(amount, currencyFrom.currencyCode, suggestCurrencyTo.currencyCode);
        return {
          title: `${result} ${suggestCurrencyTo.currencyNameEn}`,
          icon: suggestCurrencyTo.flag,
        };
      }));
    }

    const [currencyFrom, currencyTo]: Array<Currency | undefined> = uppercaseQuery.indexOf(firstCurrency.currencyCode) >
      uppercaseQuery.indexOf(secondCurrency.currencyCode)
        ? [secondCurrency, firstCurrency]
        : [firstCurrency, secondCurrency];

    if (!currencyFrom) {
      return [];
    }

    const result = await this.convert(amount, currencyFrom.currencyCode, currencyTo.currencyCode);

    if (!result) {
      return [];
    }

    this.api.storage.setItem(
      CURRENCIES_TO_HISTORY,
      [ ...new Set([...(this.currenciesToHistory ?? []), currencyTo.currencyCode]) ],
    );

    return [{
      title: `${result} ${currencyTo.currencyNameEn}`,
      icon: currencyTo.flag,
    }];

  }

  private async convert(amount: string, from: string, to: string): Promise<string | null> {
    const html = await fetch(
      `https://www.xe.com/currencyconverter/convert/?Amount=${amount}&From=${from}&To=${to}`
    ).then(r => r.text());
    const resultMatch = html.match(/iGrAod">(.*?)<span/);

    if (!resultMatch) {
      return null;
    }

    return resultMatch[1];
  }

}
