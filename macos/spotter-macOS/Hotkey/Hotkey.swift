enum Events {
  static let press: String = "onPress"
}

import Foundation
import ShellOut
import Magnet
import Carbon

@objc(GlobalHotkey)
class GlobalHotkey: RCTEventEmitter {

  @objc
  func register(_ hotkey: NSDictionary) {
    HotKeyCenter.shared.unregisterAll()

    guard let keyCombo = hotkey["doubledModifiers"] as! Bool
      ? KeyCombo(doubledCarbonModifiers: hotkey["modifiers"] as! Int)
      : KeyCombo(QWERTYKeyCode: hotkey["keyCode"] as! Int, carbonModifiers: hotkey["modifiers"] as! Int)
    else { return }

    let hotKey = HotKey(identifier: "Spotter",
                         keyCombo: keyCombo,
                         target: self,
                         action: #selector(self.onPressHotkey))
    hotKey.register()
  }

  override func supportedEvents() -> [String]! {
    return [Events.press]
  }
  
  @objc override static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc func onPressHotkey() {
    self.sendEvent(withName: Events.press, body: "")
  }

}
