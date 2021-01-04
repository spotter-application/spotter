import { NativeModules } from 'react-native';
import { SpotterAppsDimensions } from '../core';

export class AppsDimensionsNative implements SpotterAppsDimensions {
  private appsDimensions = NativeModules.AppsDimensions;

  setValue(
    appName: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    this.appsDimensions.setValue(
      appName,
      x.toString(),
      y.toString(),
      width.toString(),
      height.toString(),
    );
  }

  async getValue() {
    return await this.appsDimensions.getValue()
  }

}
