import {
  NativeModules,
} from 'react-native';

export default class Shell {
  private shell = NativeModules.Shell;

  // private appleScriptEventEmitter = new NativeEventEmitter(this.appleScript);

  execute(command: string) {
    this.shell.execute(command);
  }

}
