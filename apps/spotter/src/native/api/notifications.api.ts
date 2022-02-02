import { NativeModules } from 'react-native';
import { SpotterNotificationsApi } from '../../interfaces';

export class NotificationsApi implements SpotterNotificationsApi {
  private notifications = NativeModules.Notifications;

  show(title: string, subtitle: string) {
    this.notifications.show(title, subtitle);
  }
}
