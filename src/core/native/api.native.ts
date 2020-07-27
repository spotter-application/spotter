import {
  NativeModules,
} from 'react-native';
import { SpotterApi } from '@spotter-app/core';

export default class Api implements SpotterApi {
  private shell = NativeModules.Shell;

  shellCommand(command: string) {
    this.shell.execute(command);
  }

}
