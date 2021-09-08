import {
  SpotterOption,
  InternalPlugin,
  InternalPluginLifecycle,
  spotterSearch,
} from '../../../core';

export class PreferencesPlugin extends InternalPlugin implements InternalPluginLifecycle {

  identifier = 'Preferences';

  onQuery(query: string): SpotterOption[] {
    return spotterSearch(query, this.options, this.identifier);
  }

  get options(): SpotterOption[] {
    return [
      {
        title: 'Accounts',
        icon: '/System/Library/PreferencePanes/Accounts.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Accounts.prefPane'),
      },
      {
        title: 'Appearance Preferences',
        icon: '/System/Library/PreferencePanes/Appearance.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Appearance.prefPane'),
      },
      {
        title: 'Apple ID Preferences',
        icon: '/System/Library/PreferencePanes/AppleIDPrefPane.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/AppleIDPrefPane.prefPane'),
      },
      {
        title: 'Battery Preferences',
        icon: '/System/Library/PreferencePanes/Battery.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Battery.prefPane'),
      },
      {
        title: 'Bluetooth Preferences',
        icon: '/System/Library/PreferencePanes/Bluetooth.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Bluetooth.prefPane'),
      },
      {
        title: 'Classroom Settings Preferences',
        icon: '/System/Library/PreferencePanes/ClassroomSettings.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/ClassroomSettings.prefPane'),
      },
      {
        title: 'Date & Time Preferences',
        icon: '/System/Library/PreferencePanes/DateAndTime.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/DateAndTime.prefPane'),
      },
      {
        title: 'Desktop & Screen Saver Preferences',
        icon: '/System/Library/PreferencePanes/DesktopScreenEffectsPref.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/DesktopScreenEffectsPref.prefPane'),
      },
      {
        title: 'Displays Preferences',
        icon: '/System/Library/PreferencePanes/Displays.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Displays.prefPane'),
      },
      {
        title: 'Dock & Menu Bar Preferences',
        icon: '/System/Library/PreferencePanes/Dock.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Dock.prefPane'),
      },
      {
        title: 'Energy Saver Preferences',
        icon: '/System/Library/PreferencePanes/EnergySaver.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/EnergySaver.prefPane'),
      },
      {
        title: 'Mission Control Preferences',
        icon: '/System/Library/PreferencePanes/Expose.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Expose.prefPane'),
      },
      {
        title: 'Extensions Preferences',
        icon: '/System/Library/PreferencePanes/Extensions.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Extensions.prefPane'),
      },
      {
        title: 'Family Sharing Preferences',
        icon: '/System/Library/PreferencePanes/FamilySharingPrefPane.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/FamilySharingPrefPane.prefPane'),
      },
      {
        title: 'Fibre Channel Preferences',
        icon: '/System/Library/PreferencePanes/FibreChannel.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/FibreChannel.prefPane'),
      },
      {
        title: 'Internet Accounts Preferences',
        icon: '/System/Library/PreferencePanes/InternetAccounts.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/InternetAccounts.prefPane'),
      },
      {
        title: 'Keyboard Preferences',
        icon: '/System/Library/PreferencePanes/Keyboard.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Keyboard.prefPane'),
      },
      {
        title: 'Localization Preferences',
        icon: '/System/Library/PreferencePanes/Localization.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Localization.prefPane'),
      },
      {
        title: 'Mouse Preferences',
        icon: '/System/Library/PreferencePanes/Mouse.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Mouse.prefPane'),
      },
      {
        title: 'Network Preferences',
        icon: '/System/Library/PreferencePanes/Network.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Network.prefPane'),
      },
      {
        title: 'Notifications Preferences',
        icon: '/System/Library/PreferencePanes/Notifications.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Notifications.prefPane'),
      },
      {
        title: 'Printers & Scanners Preferences',
        icon: '/System/Library/PreferencePanes/PrintAndScan.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/PrintAndScan.prefPane'),
      },
      {
        title: 'Profiles Preferences',
        icon: '/System/Library/PreferencePanes/Profiles.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Profiles.prefPane'),
      },
      {
        title: 'Screen Time Preferences',
        icon: '/System/Library/PreferencePanes/ScreenTime.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/ScreenTime.prefPane'),
      },
      {
        title: 'Security & Privacy Preferences',
        icon: '/System/Library/PreferencePanes/Security.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Security.prefPane'),
      },
      {
        title: 'Sharing Preferences',
        icon: '/System/Library/PreferencePanes/SharingPref.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/SharingPref.prefPane'),
      },
      {
        title: 'Sidecar Preferences',
        icon: '/System/Library/PreferencePanes/Sidecar.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Sidecar.prefPane'),
      },
      {
        title: 'Software Update Preferences',
        icon: '/System/Library/PreferencePanes/SoftwareUpdate.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/SoftwareUpdate.prefPane'),
      },
      {
        title: 'Sound Preferences',
        icon: '/System/Library/PreferencePanes/Sound.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Sound.prefPane'),
      },
      {
        title: 'Siri Preferences',
        icon: '/System/Library/PreferencePanes/Speech.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Speech.prefPane'),
      },
      {
        title: 'Spotlight Preferences',
        icon: '/System/Library/PreferencePanes/Spotlight.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Spotlight.prefPane'),
      },
      {
        title: 'Startup Disk Preferences',
        icon: '/System/Library/PreferencePanes/StartupDisk.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/StartupDisk.prefPane'),
      },
      {
        title: 'Time Machine Preferences',
        icon: '/System/Library/PreferencePanes/TimeMachine.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/TimeMachine.prefPane'),
      },
      {
        title: 'Touch ID Preferences',
        icon: '/System/Library/PreferencePanes/TouchID.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/TouchID.prefPane'),
      },
      {
        title: 'Trackpad Preferences',
        icon: '/System/Library/PreferencePanes/Trackpad.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Trackpad.prefPane'),
      },
      {
        title: 'Accessibility Preferences',
        icon: '/System/Library/PreferencePanes/UniversalAccessPref.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/UniversalAccessPref.prefPane'),
      },
      {
        title: 'Wallet & Apple Pay Preferences',
        icon: '/System/Library/PreferencePanes/Wallet.prefPane',
        action: () => this.openPane('/System/Library/PreferencePanes/Wallet.prefPane'),
      },
      {
        title: 'Shutdown Preferences',
        icon: '/System/Applications/System\ Preferences.app',
        action: () => this.shutdown(),
      },
      {
        title: 'Restart Preferences',
        icon: '/System/Applications/System\ Preferences.app',
        action: () => this.restart(),
      },
      {
        title: 'Logout Preferences',
        icon: '/System/Applications/System\ Preferences.app',
        action: () => this.logout(),
      },
      {
        title: 'Sleep Preferences',
        icon: '/System/Applications/System\ Preferences.app',
        action: () => this.sleep(),
      },
    ];
  }

  private async openPane(path: string) {
    return await this.api.shell.execute(`open "${path}"`)
  }

  private async shutdown() {
    await this.api.shell.execute("osascript -e 'tell app \"System Events\" to shut down'")
  }

  private async restart() {
    await this.api.shell.execute("osascript -e 'tell app \"System Events\" to restart'")
  }

  private async logout() {
    await this.api.shell.execute("osascript -e 'tell app \"System Events\" to log out")
  }

  private async sleep() {
    await this.api.shell.execute("osascript -e 'tell app \"System Events\" to sleep'")
  }
}
