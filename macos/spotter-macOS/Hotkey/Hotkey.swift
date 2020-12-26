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
import HotKey
import ShellOut

@objc(GlobalHotkey)
class GlobalHotkey: RCTEventEmitter {
  
  override init() {
    super.init()
  }

  private var hotKey: HotKey? {
    didSet {
      
      guard let hotKey = hotKey else {
        return
      }

      hotKey.keyDownHandler = {
        self.sendEvent(withName: Events.press, body: "")
      }
    }
  }

  @objc
  func register(_ key: NSString, withModifier modifier: NSString) {
    hotKey = HotKey(keyCombo: KeyCombo(key: .space, modifiers: [.option]))
  }

  override func supportedEvents() -> [String]! {
    return [Events.press]
  }
  
  @objc override static func requiresMainQueueSetup() -> Bool {
    return false
  }

}
