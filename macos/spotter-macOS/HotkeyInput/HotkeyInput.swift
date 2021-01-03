import Foundation
import AVFoundation
import KeyHolder
import Magnet

@objc(RNHotkeyInput)
class RNHotkeyInput: RCTViewManager, NSTextFieldDelegate {
  
  var hotkeyInput = HotkeyInputView(frame: CGRect.zero);
  
  override func view() -> NSView! {
    return self.hotkeyInput;
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
