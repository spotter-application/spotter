import {
  SpotterOptionBase,
  SpotterPlugin,
  SpotterPluginLifecycle,
  spotterSearch,
} from '../../core';

export class PreferencesPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  identifier = 'Preferences';

  onQuery(query: string): SpotterOptionBase[] {
    return spotterSearch(query, this.options);
  }

  get options(): SpotterOptionBase[] {
    return [
      {
        title: 'System Preferences Accounts',
        subtitle: 'Open System Preferences Accounts',
        icon: '/System/Library/PreferencePanes/Accounts.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Accounts.prefPane'),
      },
      {
        title: 'System Preferences Appearance',
        subtitle: 'Open System Preferences Appearance',
        icon: '/System/Library/PreferencePanes/Appearance.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Appearance.prefPane'),
      },
      {
        title: 'System Preferences Apple ID',
        subtitle: 'Open System Preferences Apple ID',
        icon: '/System/Library/PreferencePanes/AppleIDPrefPane.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/AppleIDPrefPane.prefPane'),
      },
      {
        title: 'System Preferences Battery',
        subtitle: 'Open System Preferences Battery',
        icon: '/System/Library/PreferencePanes/Battery.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Battery.prefPane'),
      },
      {
        title: 'System Preferences Bluetooth',
        subtitle: 'Open System Preferences Bluetooth',
        icon: '/System/Library/PreferencePanes/Bluetooth.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Bluetooth.prefPane'),
      },
      {
        title: 'System Preferences Classroom Settings',
        subtitle: 'Open System Preferences Classroom Settings',
        icon: '/System/Library/PreferencePanes/ClassroomSettings.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/ClassroomSettings.prefPane'),
      },
      {
        title: 'System Preferences Date & Time',
        subtitle: 'Open System Preferences Date & Time',
        icon: '/System/Library/PreferencePanes/DateAndTime.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/DateAndTime.prefPane'),
      },
      {
        title: 'System Preferences Desktop & Screen Saver',
        subtitle: 'Open System Preferences Desktop & Screen Saver',
        icon: '/System/Library/PreferencePanes/DesktopScreenEffectsPref.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/DesktopScreenEffectsPref.prefPane'),
      },
      {
        title: 'System Preferences Displays',
        subtitle: 'Open System Preferences Displays',
        icon: '/System/Library/PreferencePanes/Displays.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Displays.prefPane'),
      },
      {
        title: 'System Preferences Dock & Menu Bar',
        subtitle: 'Open System Preferences Dock & Menu Bar',
        icon: '/System/Library/PreferencePanes/Dock.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Dock.prefPane'),
      },
      {
        title: 'System Preferences Energy Saver',
        subtitle: 'Open System Preferences Energy Saver',
        icon: '/System/Library/PreferencePanes/EnergySaver.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/EnergySaver.prefPane'),
      },
      {
        title: 'System Preferences Mission Control',
        subtitle: 'Open System Preferences Mission Control',
        icon: '/System/Library/PreferencePanes/Expose.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Expose.prefPane'),
      },
      {
        title: 'System Preferences Extensions',
        subtitle: 'Open System Preferences Extensions',
        icon: '/System/Library/PreferencePanes/Extensions.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Extensions.prefPane'),
      },
      {
        title: 'System Preferences Family Sharing',
        subtitle: 'Open System Preferences Family Sharing',
        icon: '/System/Library/PreferencePanes/FamilySharingPrefPane.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/FamilySharingPrefPane.prefPane'),
      },
      {
        title: 'System Preferences Fibre Channel',
        subtitle: 'Open System Preferences Fibre Channel',
        icon: '/System/Library/PreferencePanes/FibreChannel.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/FibreChannel.prefPane'),
      },
      {
        title: 'System Preferences Internet Accounts',
        subtitle: 'Open System Preferences Internet Accounts',
        icon: '/System/Library/PreferencePanes/InternetAccounts.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/InternetAccounts.prefPane'),
      },
      {
        title: 'System Preferences Keyboard',
        subtitle: 'Open System Preferences Keyboard',
        icon: '/System/Library/PreferencePanes/Keyboard.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Keyboard.prefPane'),
      },
      {
        title: 'System Preferences Localization',
        subtitle: 'Open System Preferences Localization',
        icon: '/System/Library/PreferencePanes/Localization.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Localization.prefPane'),
      },
      {
        title: 'System Preferences Mouse',
        subtitle: 'Open System Preferences Mouse',
        icon: '/System/Library/PreferencePanes/Mouse.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Mouse.prefPane'),
      },
      {
        title: 'System Preferences Network',
        subtitle: 'Open System Preferences Network',
        icon: '/System/Library/PreferencePanes/Network.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Network.prefPane'),
      },
      {
        title: 'System Preferences Notifications',
        subtitle: 'Open System Preferences Notifications',
        icon: '/System/Library/PreferencePanes/Notifications.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Notifications.prefPane'),
      },
      {
        title: 'System Preferences Printers & Scanners',
        subtitle: 'Open System Preferences Printers & Scanners',
        icon: '/System/Library/PreferencePanes/PrintAndScan.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/PrintAndScan.prefPane'),
      },
      {
        title: 'System Preferences Profiles',
        subtitle: 'Open System Preferences Profiles',
        icon: '/System/Library/PreferencePanes/Profiles.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Profiles.prefPane'),
      },
      {
        title: 'System Preferences Screen Time',
        subtitle: 'Open System Preferences Screen Time',
        icon: '/System/Library/PreferencePanes/ScreenTime.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/ScreenTime.prefPane'),
      },
      {
        title: 'System Preferences Security & Privacy',
        subtitle: 'Open System Preferences Security & Privacy',
        icon: '/System/Library/PreferencePanes/Security.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Security.prefPane'),
      },
      {
        title: 'System Preferences Sharing',
        subtitle: 'Open System Preferences Sharing',
        icon: '/System/Library/PreferencePanes/SharingPref.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/SharingPref.prefPane'),
      },
      {
        title: 'System Preferences Sidecar',
        subtitle: 'Open System Preferences Sidecar',
        icon: '/System/Library/PreferencePanes/Sidecar.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Sidecar.prefPane'),
      },
      {
        title: 'System Preferences Software Update',
        subtitle: 'Open System Preferences Software Update',
        icon: '/System/Library/PreferencePanes/SoftwareUpdate.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/SoftwareUpdate.prefPane'),
      },
      {
        title: 'System Preferences Sound',
        subtitle: 'Open System Preferences Sound',
        icon: '/System/Library/PreferencePanes/Sound.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Sound.prefPane'),
      },
      {
        title: 'System Preferences Siri',
        subtitle: 'Open System Preferences Siri',
        icon: '/System/Library/PreferencePanes/Speech.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Speech.prefPane'),
      },
      {
        title: 'System Preferences Spotlight',
        subtitle: 'Open System Preferences Spotlight',
        icon: '/System/Library/PreferencePanes/Spotlight.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Spotlight.prefPane'),
      },
      {
        title: 'System Preferences Startup Disk',
        subtitle: 'Open System Preferences Startup Disk',
        icon: '/System/Library/PreferencePanes/StartupDisk.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/StartupDisk.prefPane'),
      },
      {
        title: 'System Preferences Time Machine',
        subtitle: 'Open System Preferences Time Machine',
        icon: '/System/Library/PreferencePanes/TimeMachine.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/TimeMachine.prefPane'),
      },
      {
        title: 'System Preferences Touch ID',
        subtitle: 'Open System Preferences Touch ID',
        icon: '/System/Library/PreferencePanes/TouchID.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/TouchID.prefPane'),
      },
      {
        title: 'System Preferences Trackpad',
        subtitle: 'Open System Preferences Trackpad',
        icon: '/System/Library/PreferencePanes/Trackpad.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Trackpad.prefPane'),
      },
      {
        title: 'System Preferences Accessibility',
        subtitle: 'Open System Preferences Accessibility',
        icon: '/System/Library/PreferencePanes/UniversalAccessPref.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/UniversalAccessPref.prefPane'),
      },
      {
        title: 'System Preferences Wallet & Apple Pay',
        subtitle: 'Open System Preferences Wallet & Apple Pay',
        icon: '/System/Library/PreferencePanes/Wallet.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Wallet.prefPane'),
      },






      {
        title: 'Shutdown',
        subtitle: 'Shut down the computer',
        icon: '/System/Applications/System\ Preferences.app',
        action: () => this.shutdown(),
      },
      {
        title: 'Restart',
        subtitle: 'Restart the computer',
        icon: '/System/Applications/System\ Preferences.app',
        action: () => this.restart(),
      },
      {
        title: 'Logout',
        subtitle: 'Logout the current user',
        icon: '/System/Applications/System\ Preferences.app',
        action: () => this.logout(),
      },
      {
        title: 'Sleep',
        subtitle: 'Sleep the computer',
        icon: '/System/Applications/System\ Preferences.app',
        action: () => this.sleep(),
      },
    ];
  }

  private async openPane(path: string) {
    return await this.nativeModules.shell.execute(`open "${path}"`)
    // await this.nativeModules.shell.execute(`osascript -e '
    //   tell application "System Preferences"
    //       activate
    //       set current pane to pane id "${identifier}"
    //       ${path && path.split('>').length === 2 ? `
    //         delay 1
    //         tell application "System Events"
    //           click radio button "${path.split('>')[1]}" of tab group 1 of window "${path.split('>')[0]}" of application process "System Preferences"
    //         end tell
    //       ` : ''}
    //   end tell
    // '`)
  }

  private async shutdown() {
    await this.nativeModules.shell.execute("osascript -e 'tell app \"System Events\" to shut down'")
  }

  private async restart() {
    await this.nativeModules.shell.execute("osascript -e 'tell app \"System Events\" to restart'")
  }

  private async logout() {
    await this.nativeModules.shell.execute("osascript -e 'tell app \"System Events\" to log out")
  }

  private async sleep() {
    await this.nativeModules.shell.execute("osascript -e 'tell app \"System Events\" to sleep'")
  }
}
