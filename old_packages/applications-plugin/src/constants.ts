import { ActionType, Application } from "./interfaces";

export const ADDITIONAL_ACTIONS = [
  {
    title: 'Shutdown',
    // eslint-disable-next-line no-useless-escape
    icon: '/System/Applications/System\ Preferences.app',
    type: ActionType.shutdown,
  },
  {
    title: 'Restart',
    // eslint-disable-next-line no-useless-escape
    icon: '/System/Applications/System\ Preferences.app',
    type: ActionType.restart,
  },
  {
    title: 'Logout',
    // eslint-disable-next-line no-useless-escape
    icon: '/System/Applications/System\ Preferences.app',
    type: ActionType.logout,
  },
  {
    title: 'Sleep',
    // eslint-disable-next-line no-useless-escape
    icon: '/System/Applications/System\ Preferences.app',
    type: ActionType.sleep,
  },
  {
    title: 'Lock screen',
    // eslint-disable-next-line no-useless-escape
    icon: '/System/Applications/System\ Preferences.app',
    type: ActionType.lock,
  },
];

export const PREFERENCES: Application[] = [
  {
    title: 'Accounts',
    path: '/System/Library/PreferencePanes/Accounts.prefPane',
  },
  {
    title: 'Appearance',
    path: '/System/Library/PreferencePanes/Appearance.prefPane',
  },
  {
    title: 'Apple ID',
    path: '/System/Library/PreferencePanes/AppleIDPrefPane.prefPane',
  },
  {
    title: 'Battery',
    path: '/System/Library/PreferencePanes/Battery.prefPane',
  },
  {
    title: 'Bluetooth',
    path: '/System/Library/PreferencePanes/Bluetooth.prefPane',
  },
  {
    title: 'Classroom Settings',
    path: '/System/Library/PreferencePanes/ClassroomSettings.prefPane',
  },
  {
    title: 'Date & Time',
    path: '/System/Library/PreferencePanes/DateAndTime.prefPane',
  },
  {
    title: 'Desktop & Screen Saver',
    path: '/System/Library/PreferencePanes/DesktopScreenEffectsPref.prefPane',
  },
  {
    title: 'Displays',
    path: '/System/Library/PreferencePanes/Displays.prefPane',
  },
  {
    title: 'Dock & Menu Bar',
    path: '/System/Library/PreferencePanes/Dock.prefPane',
  },
  {
    title: 'Energy Saver',
    path: '/System/Library/PreferencePanes/EnergySaver.prefPane',
  },
  {
    title: 'Mission Control',
    path: '/System/Library/PreferencePanes/Expose.prefPane',
  },
  {
    title: 'Extensions',
    path: '/System/Library/PreferencePanes/Extensions.prefPane',
  },
  {
    title: 'Family Sharing',
    path: '/System/Library/PreferencePanes/FamilySharingPrefPane.prefPane',
  },
  {
    title: 'Fibre Channel',
    path: '/System/Library/PreferencePanes/FibreChannel.prefPane',
  },
  {
    title: 'Internet Accounts',
    path: '/System/Library/PreferencePanes/InternetAccounts.prefPane',
  },
  {
    title: 'Keyboard',
    path: '/System/Library/PreferencePanes/Keyboard.prefPane',
  },
  {
    title: 'Localization',
    path: '/System/Library/PreferencePanes/Localization.prefPane',
  },
  {
    title: 'Mouse',
    path: '/System/Library/PreferencePanes/Mouse.prefPane',
  },
  {
    title: 'Network',
    path: '/System/Library/PreferencePanes/Network.prefPane',
  },
  {
    title: 'Notifications',
    path: '/System/Library/PreferencePanes/Notifications.prefPane',
  },
  {
    title: 'Printers & Scanners',
    path: '/System/Library/PreferencePanes/PrintAndScan.prefPane',
  },
  {
    title: 'Profiles',
    path: '/System/Library/PreferencePanes/Profiles.prefPane',
  },
  {
    title: 'Screen Time',
    path: '/System/Library/PreferencePanes/ScreenTime.prefPane',
  },
  {
    title: 'Security & Privacy',
    path: '/System/Library/PreferencePanes/Security.prefPane',
  },
  {
    title: 'Sharing',
    path: '/System/Library/PreferencePanes/SharingPref.prefPane',
  },
  {
    title: 'Sidecar',
    path: '/System/Library/PreferencePanes/Sidecar.prefPane',
  },
  {
    title: 'Software Update',
    path: '/System/Library/PreferencePanes/SoftwareUpdate.prefPane',
  },
  {
    title: 'Sound',
    path: '/System/Library/PreferencePanes/Sound.prefPane',
  },
  {
    title: 'Siri',
    path: '/System/Library/PreferencePanes/Speech.prefPane',
  },
  {
    title: 'Spotlight',
    path: '/System/Library/PreferencePanes/Spotlight.prefPane',
  },
  {
    title: 'Startup Disk',
    path: '/System/Library/PreferencePanes/StartupDisk.prefPane',
  },
  {
    title: 'Time Machine',
    path: '/System/Library/PreferencePanes/TimeMachine.prefPane',
  },
  {
    title: 'Touch ID',
    path: '/System/Library/PreferencePanes/TouchID.prefPane',
  },
  {
    title: 'Trackpad',
    path: '/System/Library/PreferencePanes/Trackpad.prefPane',
  },
  {
    title: 'Accessibility',
    path: '/System/Library/PreferencePanes/UniversalAccessPref.prefPane',
  },
  {
    title: 'Wallet & Apple Pay',
    path: '/System/Library/PreferencePanes/Wallet.prefPane',
  },
];