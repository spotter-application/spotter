enum XCallbackUrlEvents {
  static let onCommand: String = "onCommand"
}

import Foundation
import Magnet
import Carbon
import CallbackURLKit

@objc(XCallbackUrl)
class XCallbackUrl: RCTEventEmitter {

  override func supportedEvents() -> [String] {
    return [XCallbackUrlEvents.onCommand]
  }
  
  public override init() {
    super.init()
    
    CallbackURLKit.register(action: "command") { parameters, success, failure, cancel in
      self.onCommand(parameters as NSDictionary)
    }
  }
  
  @objc override static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc func onCommand(_ body: NSDictionary) {
//    let body: NSDictionary = [
//      "hotkey": [
//        "keyCode": sender.keyCombo.QWERTYKeyCode,
//        "modifiers": sender.keyCombo.modifiers,
//        "doubledModifiers": sender.keyCombo.doubledModifiers,
//      ],
//      "identifier": sender.identifier
//    ];
//
    self.sendEvent(withName: "onCommand", body: body)
  }

}
