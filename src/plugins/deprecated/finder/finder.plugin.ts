import {
  SpotterOption,
  InternalPlugin,
  InternalPluginLifecycle,
  spotterSearch,
} from '../../../core';

export class FinderPlugin extends InternalPlugin implements InternalPluginLifecycle {

  identifier = 'Finder';

  onQuery(query: string): SpotterOption[] {
    return [];
    // return spotterSearch(query, [{
    //   title: 'Finder',
    //   subtitle: '/System/Library/CoreServices/Finder.app',
    //   icon: '/System/Library/CoreServices/Finder.app',
    //   action: () => this.nativeModules.shell.execute('open ~'),
    // }]);
  }

}

