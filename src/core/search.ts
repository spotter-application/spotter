import { SpotterOption } from '@spotter-app/core';

export default class SpotterSearch {

  constructor(
    private options: SpotterOption[] = [],
    private keys: string[] = ['title'],
  ) {}

  search(query = '') {
    if (query === '') {
      return [];
    }

    return this.options.filter((item: any) => this.keys.find((key) => item[key].toLowerCase().includes(query.toLowerCase())));
  }

}
