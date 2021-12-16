import { OnQueryOption } from '@spotter-app/core';
import { Plugin, promisedExec } from '@spotter-app/plugin';
import packageJSON from '../package.json';

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
      onQuery: async (q: string) => await this.getFolders(q),
    }]);
  }

  private async getFolders(q: string) {
    const root = await promisedExec(`echo $HOME`).then(r => r.split('\n')[0]);
    const folders: OnQueryOption[] = await promisedExec('ls ~/Developer')
      .then(ls => ls
        .split('\n')
        .filter(folder => !!folder)
        .map(folder => ({
          title: folder,
          icon: this.appPath,
          onSubmit: () => this.openProject(`${root}/Developer/${folder}`),
        }))
      )
      .catch(() => []);

    if (!q.length) {
      return folders;
    }

    return folders.filter(f => f.title.startsWith(q));
  }

  private open() {
    promisedExec(`open "${this.appPath}"`);
  }

  private openProject(path: string) {
    promisedExec(`open -n -b "com.microsoft.VSCode" --args "${path}"`);
  }

}
