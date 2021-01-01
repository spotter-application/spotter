import { SpotterNativeModules, SpotterOption } from './interfaces';
export class SpotterPlugin {

  constructor(
    public nativeModules: SpotterNativeModules,
    public setOptions: (options: SpotterOption[]) => void,
  ) {}

}
