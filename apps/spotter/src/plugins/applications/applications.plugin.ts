import { RegistryOption, onQueryFilter, SpotterPlugin } from '@spotter-app/core';
import { ShellApi } from '../../native';
import { ADDITIONAL_ACTIONS, PREFERENCES } from './constants';
import { getAllApplications } from './helpers';
import { ActionType } from './interfaces';

export class ApplicationsPlugin extends SpotterPlugin {

  private shell = new ShellApi();

  async onInit() {
    const applications = await getAllApplications(this.shell);

    this.spotter.setRegisteredOptions([
      ...applications.map<RegistryOption>(application => ({
        title: application.title,
        icon: application.path,
        onSubmit: () => this.open(application.path),
      })),
      ...ADDITIONAL_ACTIONS.map(action => ({
        title: action.title,
        icon: action.icon,
        onSubmit: () => this.runAction(action.type),
      })),
      {
        title: 'System Preferences',
        icon: '/System/Applications/System Preferences.app',
        onSubmit: () => this.open('/System/Applications/System Preferences.app'),
        onQuery: q => onQueryFilter(
          q,
          PREFERENCES.map(action => ({
            title: action.title,
            icon: action.path,
            onSubmit: () => this.open(action.path),
          })),
        ),
      }
    ]);
  }

  private open(path: string) {
    this.shell.execute(`open "${path}"`);
    return true;
  }

  private runAction(action: ActionType) {
    if (action === ActionType.lock) {
      this.shell.execute(`osascript << EOF
        activate application "SystemUIServer"
          tell application "System Events"
          tell process "SystemUIServer" to keystroke "q" using {command down, control down}
        end tell
      EOF`);
    } else if (action === ActionType.logout) {
      this.shell.execute("osascript -e 'tell app \"System Events\" to log out");
    } else if (action === ActionType.restart) {
      this.shell.execute("osascript -e 'tell app \"System Events\" to restart'");
    } else if (action === ActionType.shutdown) {
      this.shell.execute("osascript -e 'tell app \"System Events\" to shut down'");
    } else if (action === ActionType.sleep) {
      this.shell.execute("osascript -e 'tell app \"System Events\" to sleep'");
    }
    return true;
  }

}
