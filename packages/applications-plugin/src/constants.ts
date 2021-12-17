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
    title: 'Appearance Preferences',
    path: '/System/Library/PreferencePanes/Appearance.prefPane',
  },
  {
    title: 'Apple ID Preferences',
    path: '/System/Library/PreferencePanes/AppleIDPrefPane.prefPane',
  },
  {
    title: 'Battery Preferences',
    path: '/System/Library/PreferencePanes/Battery.prefPane',
  },
  {
    title: 'Bluetooth Preferences',
    path: '/System/Library/PreferencePanes/Bluetooth.prefPane',
  },
  {
    title: 'Classroom Settings Preferences',
    path: '/System/Library/PreferencePanes/ClassroomSettings.prefPane',
  },
  {
    title: 'Date & Time Preferences',
    path: '/System/Library/PreferencePanes/DateAndTime.prefPane',
  },
  {
    title: 'Desktop & Screen Saver Preferences',
    path: '/System/Library/PreferencePanes/DesktopScreenEffectsPref.prefPane',
  },
  {
    title: 'Displays Preferences',
    path: '/System/Library/PreferencePanes/Displays.prefPane',
  },
  {
    title: 'Dock & Menu Bar Preferences',
    path: '/System/Library/PreferencePanes/Dock.prefPane',
  },
  {
    title: 'Energy Saver Preferences',
    path: '/System/Library/PreferencePanes/EnergySaver.prefPane',
  },
  {
    title: 'Mission Control Preferences',
    path: '/System/Library/PreferencePanes/Expose.prefPane',
  },
  {
    title: 'Extensions Preferences',
    path: '/System/Library/PreferencePanes/Extensions.prefPane',
  },
  {
    title: 'Family Sharing Preferences',
    path: '/System/Library/PreferencePanes/FamilySharingPrefPane.prefPane',
  },
  {
    title: 'Fibre Channel Preferences',
    path: '/System/Library/PreferencePanes/FibreChannel.prefPane',
  },
  {
    title: 'Internet Accounts Preferences',
    path: '/System/Library/PreferencePanes/InternetAccounts.prefPane',
  },
  {
    title: 'Keyboard Preferences',
    path: '/System/Library/PreferencePanes/Keyboard.prefPane',
  },
  {
    title: 'Localization Preferences',
    path: '/System/Library/PreferencePanes/Localization.prefPane',
  },
  {
    title: 'Mouse Preferences',
    path: '/System/Library/PreferencePanes/Mouse.prefPane',
  },
  {
    title: 'Network Preferences',
    path: '/System/Library/PreferencePanes/Network.prefPane',
  },
  {
    title: 'Notifications Preferences',
    path: '/System/Library/PreferencePanes/Notifications.prefPane',
  },
  {
    title: 'Printers & Scanners Preferences',
    path: '/System/Library/PreferencePanes/PrintAndScan.prefPane',
  },
  {
    title: 'Profiles Preferences',
    path: '/System/Library/PreferencePanes/Profiles.prefPane',
  },
  {
    title: 'Screen Time Preferences',
    path: '/System/Library/PreferencePanes/ScreenTime.prefPane',
  },
  {
    title: 'Security & Privacy Preferences',
    path: '/System/Library/PreferencePanes/Security.prefPane',
  },
  {
    title: 'Sharing Preferences',
    path: '/System/Library/PreferencePanes/SharingPref.prefPane',
  },
  {
    title: 'Sidecar Preferences',
    path: '/System/Library/PreferencePanes/Sidecar.prefPane',
  },
  {
    title: 'Software Update Preferences',
    path: '/System/Library/PreferencePanes/SoftwareUpdate.prefPane',
  },
  {
    title: 'Sound Preferences',
    path: '/System/Library/PreferencePanes/Sound.prefPane',
  },
  {
    title: 'Siri Preferences',
    path: '/System/Library/PreferencePanes/Speech.prefPane',
  },
  {
    title: 'Spotlight Preferences',
    path: '/System/Library/PreferencePanes/Spotlight.prefPane',
  },
  {
    title: 'Startup Disk Preferences',
    path: '/System/Library/PreferencePanes/StartupDisk.prefPane',
  },
  {
    title: 'Time Machine Preferences',
    path: '/System/Library/PreferencePanes/TimeMachine.prefPane',
  },
  {
    title: 'Touch ID Preferences',
    path: '/System/Library/PreferencePanes/TouchID.prefPane',
  },
  {
    title: 'Trackpad Preferences',
    path: '/System/Library/PreferencePanes/Trackpad.prefPane',
  },
  {
    title: 'Accessibility Preferences',
    path: '/System/Library/PreferencePanes/UniversalAccessPref.prefPane',
  },
  {
    title: 'Wallet & Apple Pay Preferences',
    path: '/System/Library/PreferencePanes/Wallet.prefPane',
  },
];