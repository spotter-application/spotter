import { Application, SpotterOption, SpotterShell } from './interfaces';
import {
  SpotterHotkeyEvent,
  SpotterRegistries,
  SPOTTER_HOTKEY_IDENTIFIER,
  SpotterApi,
} from '../core';

export const spotterGlobalHotkeyPress = (
  event: SpotterHotkeyEvent,
  registries: SpotterRegistries,
  api: SpotterApi,
): void => {
  if (event.identifier === SPOTTER_HOTKEY_IDENTIFIER) {
    registries.plugins.onOpenSpotter();
    api.panel.open();
    return;
  };

  const [pluginIdentifier, optionTitle] = event.identifier.split('#');

  const plugin = registries.plugins.list[pluginIdentifier];

  if (!plugin || !plugin.options?.length) {
    return;
  }

  const option = plugin.options.find((o: SpotterOption) => o.title === optionTitle);

  if (!option || !option.action) {
    return;
  }

  option.action();
};

export const spotterSearch = (
  query: string,
  options: SpotterOption[],
  prefix?: string,
): SpotterOption[] => {
  if (!query || !options?.length) {
    return [];
  };

  if (!prefix) {
    return search(query, options);
  };

  const [ prefixFromQuery, ...restQuery ] = query.split(' ');
  const queryWithoutPrefix = restQuery.join(' ');

  if (prefix.toLowerCase().startsWith(prefixFromQuery.toLowerCase())) {
    // Display all
    if (prefixFromQuery && !queryWithoutPrefix) {
      return search('', options);
    }

    return search(queryWithoutPrefix, options);
  };

  // Search without prefix
  return search(query, options);
};

const search = (query: string, options: SpotterOption[]): SpotterOption[] => {
  if (!query && options?.length) {
    return options;
  };

  if (!options?.length) {
    return [];
  };

  return options
    .filter((item: SpotterOption) => (
      (item.title?.split(' ')?.find(t => t.toLowerCase().startsWith(query.toLocaleLowerCase()))) ||
      (item.keywords?.find(k => k.toLowerCase().startsWith(query.toLocaleLowerCase())))
    ))
    .sort((a, b) => a.title?.indexOf(query) - b.title?.indexOf(query));
}

export const getAllApplications = async (shell: SpotterShell): Promise<Application[]> => {
  const paths = [
    '/System/Applications',
    '/System/Applications/Utilities',
    '/Applications',
    '/Users/$USER/Applications',
    '/Users/$USER/Applications/Chrome Apps.localized',
  ];

  const applicationsStrings: Application[][] = await Promise.all(
    paths.map(async path => await getDeepApplicationsStrings(shell, path)),
  );

  const applications = applicationsStrings.reduce((acc, apps) => ([...acc, ...apps]), []);

  return [
    ...applications,
    {
      title: 'Finder',
      path: '/System/Library/CoreServices/Finder.app',
    }
  ];
}

async function getDeepApplicationsStrings(shell: SpotterShell, path: string): Promise<Application[]> {
  const applicationsStrings = await shell
    .execute(`cd ${path.replace(/(\s+)/g, '\\$1')} && ls`)
    .then(res => res.split('\n')
      .reduce<Promise<Application[]>>(async (acc, title) => {
        const resolvedAcc = await acc;

        if (title.endsWith('.app')) {
          return [
            ...resolvedAcc,
            { title: title.replace('.app', ''), path: `${path}/${title}` },
          ];
        }

        if (path.split('/').length > 2) {
          return resolvedAcc;
        }

        const deepApplicationsStrings = await getDeepApplicationsStrings(shell, `${path}/${title}`);
        return [...resolvedAcc, ...deepApplicationsStrings];
      }, Promise.resolve([]))
    );
  return applicationsStrings;
}

export function omit<T>(keys: string[], obj: { [key: string]: any }): T  {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([k]) => !keys.includes(k))
  ) as T;
}

