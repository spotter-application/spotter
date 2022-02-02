import { ShellApi } from '../../native';
import { Application } from './interfaces';

export const getAllApplications = async (
  shell: ShellApi
): Promise<Application[]> => {
  const paths = [
    '/System/Applications',
    '/System/Applications/Utilities',
    '/Applications',
    '~/Applications',
    '~/Applications/Chrome Apps.localized',
  ];

  const applications: Application[] = await paths.reduce<Promise<Application[]>>(
    async (asyncAcc, path) => {
      return [
        ...(await asyncAcc),
        ...(await getDeepApplications(path, shell)),
      ];
    },
    Promise.resolve([]),
  );

  return [
    ...applications.filter(a => a.title !== 'System Preferences'),
    {
      title: 'Finder',
      path: '/System/Library/CoreServices/Finder.app',
    }
  ];
}

async function getDeepApplications(
  path: string,
  shell: ShellApi,
): Promise<Application[]> {
  if (path.startsWith('~')) {
    const user = await shell.execute('echo $USER');
    path = path.replace('~', `/Users/${user}`);
  }

  const applicationsStrings = await shell.execute(
    `cd ${path.replace(/(\s+)/g, '\\$1')} && ls || echo ''`
  )
    .then((res: string) => res.split('\n')
    .reduce<Promise<Application[]>>(async (acc, title) => {
      const resolvedAcc = await acc;

      if (title.endsWith('.app')) {
        return [
          ...resolvedAcc,
          {
            title: title.replace('.app', ''),
            path: `${path}/${title}`,
          },
        ];
      }

      if (path.split('/').length > 2) {
        return resolvedAcc;
      }

      if (!title) {
        return resolvedAcc;
      }

      const deepApplicationsStrings =
        await getDeepApplications(`${path}/${title}`, shell);
      return [...resolvedAcc, ...deepApplicationsStrings];
    }, Promise.resolve([])));

  return applicationsStrings;
}
