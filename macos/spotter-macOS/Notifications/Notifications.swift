import Foundation
import ShellOut
import Magnet
import Carbon

@objc(Notifications)
class Notifications: RCTEventEmitter, NSUserNotificationCenterDelegate {

  override init() {
    super.init()
    
    NSUserNotificationCenter.default.delegate = self
  }
  
  @objc
  func show(_ title: NSString, withSubtitle subtitle: NSString) -> Void {
    let notification = NSUserNotification()
    notification.title = title as String
    notification.subtitle = subtitle as String
    notification.soundName = NSUserNotificationDefaultSoundName
    NSUserNotificationCenter.default.delegate = self
    NSUserNotificationCenter.default.deliver(notification)
  }
  
  func userNotificationCenter(_ center: NSUserNotificationCenter,
                                           shouldPresent notification: NSUserNotification) -> Bool {
    return true
  }
  
  override func supportedEvents() -> [String]! {
    return []
  }
  
  @objc override static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
}
