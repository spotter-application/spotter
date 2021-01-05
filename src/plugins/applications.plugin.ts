import {
  SpotterOption,
  SpotterPlugin,
  SpotterPluginLifecycle,
  spotterSearch,
} from '../core';

interface Application {
  title: string,
  path: string,
}

export class ApplicationsPlugin extends SpotterPlugin implements SpotterPluginLifecycle {
  private applications: SpotterOption[] = [];

  private async getAllApplications(): Promise<Application[]> {
    const paths = [
      '/System/Applications',
      '/System/Applications/Utilities',
      '/Applications',
    ];

    const applicationsStrings: Application[][] = await Promise.all(
      paths.map(async path =>
        await this.nativeModules.shell
          .execute(`cd ${path} && ls`)
          .then(res => res.split('\n')
            .filter(title => title.endsWith('.app') && title !== 'spotter.app')
            .map(title => ({ title: title.replace('.app', ''), path: `${path}/${title}` }))
          )
      ),
    );

    const applications = applicationsStrings.reduce((acc, apps) => ([...acc, ...apps]), []);

    return applications;
  }

  async onInit() {
    this.applications = (await this.getAllApplications()).map(app => ({
      title: app.title,
      subtitle: app.path,
      image: app.path,
      action: async () => await this.nativeModules.shell.execute(`open "${app.path}"`),
    }));
  }

  onQuery(query: string): SpotterOption[] {
    return spotterSearch(query, this.applications);
  }

}
