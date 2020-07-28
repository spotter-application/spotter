import {
  NativeModules,
} from 'react-native';
import { SpotterApi, SystemApplication } from '@spotter-app/core';

export default class Api implements SpotterApi {
  private shell = NativeModules.Shell;
  private applications = NativeModules.Applications;

  shellCommand(command: string): void {
    this.shell.execute(command);
  }

  async getAllApplications(): Promise<SystemApplication[]> {
    return await this.applications.getAll();
  }

  openApplication(path: string): void {
    this.applications.open(path);
  }

}
