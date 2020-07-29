import { AsyncStorage } from 'react-native';

// TODO: Move to core
export declare abstract class SpotterStorage {

  abstract setItem<T>(key: string, value: T): Promise<void>

  abstract getItem<T>(key: string): Promise<T | null>

}

export default class Storage implements SpotterStorage {

  async setItem<T>(key: string, value: T): Promise<void> {
    return await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  async getItem<T>(key: string): Promise<T | null> {
    const value = await AsyncStorage.getItem(key);
    if (value === undefined || value === null) {
      return null;
    }

    return JSON.parse(value);
  }

}
