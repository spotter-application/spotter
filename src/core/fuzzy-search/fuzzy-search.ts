import FuzzySearchHelper from "./fuzzy-search-helper";

// TODO: Should be part of core
export default class SpotterSearch {

  constructor(
    private haystack: any = [],
    private keys: any = [],
    private options: any = {},
  ) {
    if (! Array.isArray(keys)) {
      options = keys;
      keys = [];
    }

    this.haystack = haystack;
    this.keys = keys;
    this.options = Object.assign({
      caseSensitive: false,
      sort: false,
    }, options);
  }

  search(query = '') {
    if (query === '') {
      return this.haystack;
    }

    const results = [];

    for (let i = 0; i < this.haystack.length; i++) {
      const item = this.haystack[i];

      if (this.keys.length === 0) {
        const score = SpotterSearch.isMatch(item, query, this.options.caseSensitive);

        if (score) {
          results.push({ item, score });
        }
      } else {
        for (let y = 0; y < this.keys.length; y++) {
          const propertyValues = FuzzySearchHelper.getDescendantProperty(item, this.keys[y]);

          let found = false;

          for (let z = 0; z < propertyValues.length; z++) {
            const score = SpotterSearch.isMatch(propertyValues[z], query, this.options.caseSensitive);

            if (score) {
              found = true;

              results.push({ item, score });

              break;
            }
          }

          if (found) {
            break;
          }
        }
      }
    }

    if (this.options.sort) {
      results.sort((a, b) => a.score - b.score);
    }

    return results.map(result => result.item);
  }

  static isMatch(item: any, query: any, caseSensitive: any) {
    item = String(item);
    query = String(query);

    if (! caseSensitive) {
      item = item.toLocaleLowerCase();
      query = query.toLocaleLowerCase();
    }

    const indexes = SpotterSearch.nearestIndexesFor(item, query);

    if (! indexes) {
      return false;
    }

    // Exact matches should be first.
    if (item === query) {
      return 1;
    }

    // If we have more than 2 letters, matches close to each other should be first.
    if (indexes.length > 1) {
      return 2 + (indexes[indexes.length - 1] - indexes[0]);
    }

    // Matches closest to the start of the string should be first.
    return 2 + indexes[0];
  }

  static nearestIndexesFor(item: any, query: any) {
    const letters = query.split('');
    let indexes: any = [];

    const indexesOfFirstLetter = SpotterSearch.indexesOfFirstLetter(item, query);

    indexesOfFirstLetter.forEach((startingIndex: any, loopingIndex: any) => {
      let index = startingIndex + 1;

      indexes[loopingIndex] = [startingIndex];

      for (let i = 1; i < letters.length; i++) {
        const letter = letters[i];

        index = item.indexOf(letter, index);

        if (index === -1) {
          indexes[loopingIndex] = false;

          break;
        }

        indexes[loopingIndex].push(index);

        index++;
      }
    });

    indexes = indexes.filter((letterIndexes: any) => letterIndexes !== false);

    if (! indexes.length) {
      return false;
    }

    return indexes.sort((a: any, b: any) => {
      if (a.length === 1) {
        return a[0] - b[0];
      }

      a = a[a.length - 1] - a[0];
      b = b[b.length - 1] - b[0];

      return a - b;
    })[0];
  }

  static indexesOfFirstLetter(item: any, query: any) {
    const match = query[0];

    return item.split('').map((letter: any, index: any) => {
      if (letter !== match) {
        return false;
      }

      return index;
    }).filter((index: any) => index !== false);
  }
}
