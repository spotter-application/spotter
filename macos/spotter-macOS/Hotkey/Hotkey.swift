enum Events {
  static let press: String = "onPress"
}

import Foundation
import Magnet
import Carbon

@objc(SpotterHotkey)
class SpotterHotkey: RCTEventEmitter {

  @objc
  func register(_ hotkey: NSDictionary?, withIdentifier identifier: NSString) {
    HotKeyCenter.shared.unregisterHotKey(with: identifier as String)
    
    if (hotkey == nil) {
      return
    }

    guard let keyCombo = hotkey?["doubledModifiers"] as! Bool
            ? KeyCombo(doubledCarbonModifiers: hotkey!["modifiers"] as! Int)
            : KeyCombo(QWERTYKeyCode: hotkey!["keyCode"] as! Int, carbonModifiers: hotkey!["modifiers"] as! Int)
    else { return }

    let hotKey = HotKey(identifier: identifier as String,
                         keyCombo: keyCombo,
                         target: self,
                         action: #selector(self.onPressHotkey))
    
    hotKey.register()
  }

  override func supportedEvents() -> [String]? {
    return [Events.press]
  }
  
  @objc override static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc func onPressHotkey(_ sender: HotKey) {
    let body: NSDictionary = [
      "hotkey": [
        "keyCode": sender.keyCombo.QWERTYKeyCode,
        "modifiers": sender.keyCombo.modifiers,
        "doubledModifiers": sender.keyCombo.doubledModifiers,
      ],
      "identifier": sender.identifier
    ];
    
    self.sendEvent(withName: Events.press, body: body)
  }

}
