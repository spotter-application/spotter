import { RegistryOption } from '@spotter-app/core';
import { Plugin } from '@spotter-app/plugin';
import { exec } from 'node:child_process';
import { ADDITIONAL_ACTIONS } from './constants';
import { getAllApplications } from './helpers';
import { ActionType } from './interfaces';

new class ApplicationsPlugin extends Plugin {

  constructor() {
    super('applications-plugin');
  }

  async onInit() {
    const applications = await getAllApplications()
    this.spotter.setRegisteredOptions([
      ...applications.map<RegistryOption>(application => ({
        title: application.title,
        icon: application.path,
        onSubmit: () => this.runApplication(application.path),
      })),
      ...ADDITIONAL_ACTIONS.map(action => ({
        title: action.title,
        icon: action.icon,
        onSubmit: () => this.runAction(action.type),
      }))
    ]);
  }

  private runApplication(path: string) {
    exec(`open "${path}"`);
    return true;
  }

  private runAction(action: ActionType) {
    if (action === ActionType.lock) {
      exec(`osascript << EOF
        activate application "SystemUIServer"
          tell application "System Events"
          tell process "SystemUIServer" to keystroke "q" using {command down, control down}
        end tell
      EOF`);
    } else if (action === ActionType.logout) {
      exec("osascript -e 'tell app \"System Events\" to log out");
    } else if (action === ActionType.restart) {
      exec("osascript -e 'tell app \"System Events\" to restart'");
    } else if (action === ActionType.shutdown) {
      exec("osascript -e 'tell app \"System Events\" to shut down'");
    } else if (action === ActionType.sleep) {
      exec("osascript -e 'tell app \"System Events\" to sleep'");
    }
    return true;
  }

}
