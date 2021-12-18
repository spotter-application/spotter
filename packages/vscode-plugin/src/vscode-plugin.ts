import { OnQueryOption } from '@spotter-app/core';
import { onQueryFilter, Plugin, promisedExec } from '@spotter-app/plugin';
import packageJSON from '../package.json';

interface Storage {
  folders: string[],
}

new class CalculatorPlugin extends Plugin {
  private appPath = '/Applications/Visual Studio Code.app';

  constructor() {
    super({
      name: packageJSON.name,
      icon: '/Applications/Visual Studio Code.app',
      version: packageJSON.version,
    });
  }

  async onInit() {
    this.spotter.setRegisteredOptions([{
      title: 'Visual Studio Code',
      prefix: 'vsc',
      icon: this.appPath,
      replaceOptions: ['Visual Studio Code'],
      onSubmit: this.open,
      onQuery: async (q: string) => await this.getOptions(q),
    }]);
  }

  private async getOptions(q: string): Promise<OnQueryOption[]> {
    const storage = await this.spotter.getStorage<Storage>();
    const folders = storage.folders ?? [];
    const projects = await folders
      .reduce<Promise<OnQueryOption[]>>(async (acc, f) => {
        const resolvedAcc = await acc;
        const projects = await this.getDeepGitProjects(f);
        return [
          ...resolvedAcc,
          ...projects,
        ];
      }, Promise.resolve<OnQueryOption[]>([]))

    return onQueryFilter(
      q,
      [
        ...projects,
        {
          title: 'Add root folder',
          onQuery: (q: string) => this.getFolders(q),
          icon: this.appPath,
        },
        ...(folders?.length ? [{
          title: 'Root folders',
          onQuery: (q: string) => onQueryFilter(
            q,
            folders.map(f => ({
              title: f,
              subtitle: 'Remove',
              icon: this.appPath,
              onSubmit: () => this.removeRootFolder(f),
            })),
          ),
          icon: this.appPath,
        }] : []),
      ],
    );
  }

  private async addRootFolder(folder: string) {
    const storage = await this.spotter.getStorage<Storage>();
    const folders = storage.folders ?? [];

    if (folders.find(f => f === folder)) {
      return;
    }

    this.spotter.setStorage<Storage>({
      folders: [
        ...folders,
        folder,
      ],
    });
  }

  private async removeRootFolder(folder: string) {
    const storage = await this.spotter.getStorage<Storage>();
    this.spotter.setStorage<Storage>({
      folders: (storage.folders ?? []).filter(f => f !== folder),
    });
  }

  private async getFolders(query: string) {
    this.spotter.setPlaceholder('New root folder path...');
    if (!query) {
      return [];
    }

    if (query.startsWith('~')) {
      const root = await promisedExec(`echo $HOME`).then(r => r.split('\n')[0]);
      query = query.replace('~', root);
    }

    let folder = query;

    if (folder.endsWith('/')) {
      folder = folder.substring(0, folder.length - 1);
    } else {
      const paths = folder.split('/').filter(f => !!f);
      paths.pop();
      folder = `/${paths.join('/')}`;
    }

    const folders: OnQueryOption[] = await promisedExec(`cd ${folder} && ls`)
      .then(ls => ls
        .split('\n')
        .filter(f => !!f)
        .reduce<Promise<OnQueryOption[]>>(async (acc, f) => {
          const resolvedAcc = await acc;
          return [
            ...resolvedAcc,
            {
              title: `${folder}/${f}`,
              subtitle: 'Add as a root folder',
              icon: this.appPath,
              onSubmit: () => this.addRootFolder(`${folder}/${f}`),
            },
          ];
        }, Promise.resolve<OnQueryOption[]>([]))
      )
      .catch(() => []);
    
    return onQueryFilter(query, folders);
  }

  private async getDeepGitProjects(folder: string) {
    const folders: OnQueryOption[] = await promisedExec(`cd ${folder} && ls`)
      .then(ls => ls
        .split('\n')
        .filter(f => !!f)
        .reduce<Promise<OnQueryOption[]>>(async (acc, f) => {
          const resolvedAcc = await acc;

          const hasGit = await promisedExec(`cd ${folder}/${f} && ls -all`)
            .then(r => r.includes('.git'))
            .catch(() => false);

          if (!hasGit) {
            const childProjects = await this.getDeepGitProjects(`${folder}/${f}`)
            return [
              ...childProjects,
              ...resolvedAcc,
            ];
          }

          return [
            ...resolvedAcc,
            {
              title: `${folder}/${f}`,
              icon: this.appPath,
              onSubmit: () => this.openProject(`${folder}/${f}`),
            },
          ];
        }, Promise.resolve<OnQueryOption[]>([]))
      )
      .catch(() => []);
    
    return folders;
  }

  private open() {
    promisedExec(`open "${this.appPath}"`);
  }

  private openProject(path: string) {
    promisedExec(`open -n -b "com.microsoft.VSCode" --args "${path}"`);
  }

}
