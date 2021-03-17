import { SpotterOption, SpotterPlugin, SpotterPluginLifecycle, spotterSearch, SpotterShell } from '../../core';
import icon from './icon.png';

interface Gpg {
  title: string
}

export class PassPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  identifier = 'Pass';

  private storePath = '~/.password-store';
  private passes: SpotterOption[] = [];

  async onOpenSpotter() {
    const passes = await this.getAllGpgFiles(this.nativeModules.shell);
    this.passes = passes.map(pass => ({
      title: pass.title,
      subtitle: 'Copy to clipboard',
      icon,
      action: async () => await this.nativeModules.shell.execute(`pass -c ${pass.title}`),
    }));
  }

  async onQuery(query: string): Promise<SpotterOption[]> {
    return spotterSearch(query, this.passes, this.identifier);
  }

  async getAllGpgFiles(shell: SpotterShell): Promise<Gpg[]> {
    const gpgs = await shell
      .execute(`find ${this.storePath} -type f -name '*.gpg'`)
      .then(res => res.split('\n')
        .reduce<Promise<Gpg[]>>(async (acc, title) => {
          const resolvedAcc = await acc;

          const currentUser = await shell.execute('id -un');

          return [
            ...resolvedAcc,
            { title: title.replace('.gpg', '')
              .replace(`/Users/${currentUser}/${this.storePath.replace('~/', '')}/`, '') },
          ];
        }, Promise.resolve([]))
      );
    return gpgs;
  }
}
