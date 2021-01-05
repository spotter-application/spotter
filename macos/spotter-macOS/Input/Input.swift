import Foundation
import AVFoundation

@objc(RNInput)
class RNInput: RCTViewManager {
  
  var textField = CustomNSTextField(frame: NSMakeRect(200,20,200,20));
  
  override func view() -> NSView! {
    self.textField.becomeFirstResponder();
    return self.textField;
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
