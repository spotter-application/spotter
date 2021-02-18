import {
  SpotterOptionBase,
  SpotterPlugin,
  SpotterPluginLifecycle,
  spotterSearch,
} from '../../core';

export class PreferencesPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  identifier = 'Preferences';

  onQuery(query: string): SpotterOptionBase[] {
    return spotterSearch(query, this.options, this.identifier);
  }

  get options(): SpotterOptionBase[] {
    return [
      {
        title: 'System Preferences Accounts',
        icon: '/System/Library/PreferencePanes/Accounts.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Accounts.prefPane'),
      },
      {
        title: 'System Preferences Appearance',
        icon: '/System/Library/PreferencePanes/Appearance.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Appearance.prefPane'),
      },
      {
        title: 'System Preferences Apple ID',
        icon: '/System/Library/PreferencePanes/AppleIDPrefPane.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/AppleIDPrefPane.prefPane'),
      },
      {
        title: 'System Preferences Battery',
        icon: '/System/Library/PreferencePanes/Battery.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Battery.prefPane'),
      },
      {
        title: 'System Preferences Bluetooth',
        icon: '/System/Library/PreferencePanes/Bluetooth.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Bluetooth.prefPane'),
      },
      {
        title: 'System Preferences Classroom Settings',
        icon: '/System/Library/PreferencePanes/ClassroomSettings.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/ClassroomSettings.prefPane'),
      },
      {
        title: 'System Preferences Date & Time',
        icon: '/System/Library/PreferencePanes/DateAndTime.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/DateAndTime.prefPane'),
      },
      {
        title: 'System Preferences Desktop & Screen Saver',
        icon: '/System/Library/PreferencePanes/DesktopScreenEffectsPref.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/DesktopScreenEffectsPref.prefPane'),
      },
      {
        title: 'System Preferences Displays',
        icon: '/System/Library/PreferencePanes/Displays.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Displays.prefPane'),
      },
      {
        title: 'System Preferences Dock & Menu Bar',
        icon: '/System/Library/PreferencePanes/Dock.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Dock.prefPane'),
      },
      {
        title: 'System Preferences Energy Saver',
        icon: '/System/Library/PreferencePanes/EnergySaver.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/EnergySaver.prefPane'),
      },
      {
        title: 'System Preferences Mission Control',
        icon: '/System/Library/PreferencePanes/Expose.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Expose.prefPane'),
      },
      {
        title: 'System Preferences Extensions',
        icon: '/System/Library/PreferencePanes/Extensions.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Extensions.prefPane'),
      },
      {
        title: 'System Preferences Family Sharing',
        icon: '/System/Library/PreferencePanes/FamilySharingPrefPane.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/FamilySharingPrefPane.prefPane'),
      },
      {
        title: 'System Preferences Fibre Channel',
        icon: '/System/Library/PreferencePanes/FibreChannel.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/FibreChannel.prefPane'),
      },
      {
        title: 'System Preferences Internet Accounts',
        icon: '/System/Library/PreferencePanes/InternetAccounts.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/InternetAccounts.prefPane'),
      },
      {
        title: 'System Preferences Keyboard',
        icon: '/System/Library/PreferencePanes/Keyboard.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Keyboard.prefPane'),
      },
      {
        title: 'System Preferences Localization',
        icon: '/System/Library/PreferencePanes/Localization.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Localization.prefPane'),
      },
      {
        title: 'System Preferences Mouse',
        icon: '/System/Library/PreferencePanes/Mouse.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Mouse.prefPane'),
      },
      {
        title: 'System Preferences Network',
        icon: '/System/Library/PreferencePanes/Network.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Network.prefPane'),
      },
      {
        title: 'System Preferences Notifications',
        icon: '/System/Library/PreferencePanes/Notifications.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Notifications.prefPane'),
      },
      {
        title: 'System Preferences Printers & Scanners',
        icon: '/System/Library/PreferencePanes/PrintAndScan.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/PrintAndScan.prefPane'),
      },
      {
        title: 'System Preferences Profiles',
        icon: '/System/Library/PreferencePanes/Profiles.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Profiles.prefPane'),
      },
      {
        title: 'System Preferences Screen Time',
        icon: '/System/Library/PreferencePanes/ScreenTime.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/ScreenTime.prefPane'),
      },
      {
        title: 'System Preferences Security & Privacy',
        icon: '/System/Library/PreferencePanes/Security.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Security.prefPane'),
      },
      {
        title: 'System Preferences Sharing',
        icon: '/System/Library/PreferencePanes/SharingPref.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/SharingPref.prefPane'),
      },
      {
        title: 'System Preferences Sidecar',
        icon: '/System/Library/PreferencePanes/Sidecar.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Sidecar.prefPane'),
      },
      {
        title: 'System Preferences Software Update',
        icon: '/System/Library/PreferencePanes/SoftwareUpdate.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/SoftwareUpdate.prefPane'),
      },
      {
        title: 'System Preferences Sound',
        icon: '/System/Library/PreferencePanes/Sound.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Sound.prefPane'),
      },
      {
        title: 'System Preferences Siri',
        icon: '/System/Library/PreferencePanes/Speech.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Speech.prefPane'),
      },
      {
        title: 'System Preferences Spotlight',
        icon: '/System/Library/PreferencePanes/Spotlight.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Spotlight.prefPane'),
      },
      {
        title: 'System Preferences Startup Disk',
        icon: '/System/Library/PreferencePanes/StartupDisk.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/StartupDisk.prefPane'),
      },
      {
        title: 'System Preferences Time Machine',
        icon: '/System/Library/PreferencePanes/TimeMachine.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/TimeMachine.prefPane'),
      },
      {
        title: 'System Preferences Touch ID',
        icon: '/System/Library/PreferencePanes/TouchID.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/TouchID.prefPane'),
      },
      {
        title: 'System Preferences Trackpad',
        icon: '/System/Library/PreferencePanes/Trackpad.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Trackpad.prefPane'),
      },
      {
        title: 'System Preferences Accessibility',
        icon: '/System/Library/PreferencePanes/UniversalAccessPref.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/UniversalAccessPref.prefPane'),
      },
      {
        title: 'System Preferences Wallet & Apple Pay',
        icon: '/System/Library/PreferencePanes/Wallet.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Wallet.prefPane'),
      },
      {
        title: 'Shutdown',
        icon: '/System/Applications/System\ Preferences.app',
        action: () => this.shutdown(),
      },
      {
        title: 'Restart',
        icon: '/System/Applications/System\ Preferences.app',
        action: () => this.restart(),
      },
      {
        title: 'Logout',
        icon: '/System/Applications/System\ Preferences.app',
        action: () => this.logout(),
      },
      {
        title: 'Sleep',
        icon: '/System/Applications/System\ Preferences.app',
        action: () => this.sleep(),
      },
    ];
  }

  private async openPane(path: string) {
    return await this.nativeModules.shell.execute(`open "${path}"`)
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
