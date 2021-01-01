enum KeyCode {
  static let esc: UInt16 = 53
  static let enter: UInt16 = 36
  static let upArrow: UInt16 = 126
  static let downArrow: UInt16 = 125
}

enum Events {
  static let press: String = "onPress"
  static let esc: String = "onEsc"
  static let upArrow: String = "onUpArrow"
  static let downArrow: String = "onDownArrow"
}

import Foundation
import ShellOut
import Magnet
import Carbon

@objc(GlobalHotkey)
class GlobalHotkey: RCTEventEmitter {
  
  let appDelegate = NSApplication.shared.delegate as! AppDelegate

  @objc
  func register(_ key: NSString, withModifier modifier: NSString) {
    guard let keyCombo = KeyCombo(doubledCarbonModifiers: shiftKey) else { return }
    let hotKey = HotKey(identifier: "Spotter",
                         keyCombo: keyCombo,
                         target: self,
                         action: #selector(self.tappedDoubleShiftKey))
    hotKey.register()
  }

  override func supportedEvents() -> [String]! {
    return [Events.press]
  }
  
  @objc override static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc func tappedDoubleShiftKey() {
    self.sendEvent(withName: Events.press, body: "")
  }
  
  @objc func openSettings() {
    DispatchQueue.main.async {
      self.appDelegate.openSettings()
    }
  }

}
