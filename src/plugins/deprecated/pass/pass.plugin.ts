import { SpotterOption, InternalPlugin, InternalPluginLifecycle, spotterSearch, SpotterShell } from '../../../core';
import icon from './icon.png';

interface Gpg {
  title: string
}

export class PassPlugin extends InternalPlugin implements InternalPluginLifecycle {

  identifier = 'Pass';

  private storePath = '~/.password-store';
  private passes: SpotterOption[] = [];

  async onOpenSpotter() {
    const passes = await this.getAllGpgFiles(this.api.shell);
    this.passes = passes.map(pass => ({
      title: pass.title,
      subtitle: 'Copy to clipboard',
      icon,
      action: async () => await this.api.shell.execute(`pass -c ${pass.title}`),
    }));
  }

  async onQuery(query: string): Promise<SpotterOption[]> {
    const [ prefixFromQuery, ] = query.split(' ');

    if (!this.identifier.toLowerCase().includes(prefixFromQuery.toLowerCase())) {
      return [];
    }

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
