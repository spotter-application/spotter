import { SpotterOption } from '@spotter-app/core';

export default class SpotterSearch {

  constructor(
    private options: SpotterOption[] = [],
  ) {}

  search(query = '') {
    if (query === '') {
      return [];
    }

    return this.options
      .filter((item: SpotterOption) => item.title.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.title.indexOf(query) - b.title.indexOf(query))
  }

}
