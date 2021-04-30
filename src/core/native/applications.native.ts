import { NativeModules } from 'react-native';
import { SpotterApplicationsNative } from '..';

export class ApplicationsNative implements SpotterApplicationsNative {
  private applications = NativeModules.Applications;

  setDimensions(
    appName: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    this.applications.setDimensions(
      appName,
      x.toString(),
      y.toString(),
      width.toString(),
      height.toString(),
    );
  }

  async getDimensions() {
    return await this.applications.getDimensions();
  }

  async getRunningList() {
    const apps = await this.applications.getRunningList();
    if (!apps?.length) {
      return [];
    }

    return apps.map((app: { appName: string }) => app.appName);
  }

}
