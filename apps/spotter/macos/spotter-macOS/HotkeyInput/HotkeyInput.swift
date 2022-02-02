import Foundation
import AVFoundation
import KeyHolder
import Magnet

@objc(RNHotkeyInput)
class RNHotkeyInput: RCTViewManager, NSTextFieldDelegate {
  
  override func view() -> NSView! {
    return HotkeyInputView(frame: CGRect.zero);
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
