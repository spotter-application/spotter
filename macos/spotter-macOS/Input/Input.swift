import Foundation
import AVFoundation

@objc(RNInput)
class RNInput: RCTViewManager, NSTextFieldDelegate {
  
  override func view() -> NSView! {    
    return CustomNSTextField(frame: NSMakeRect(200,20,200,20));
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
