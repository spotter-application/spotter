import Foundation
import AVFoundation

@objc(RNIconImage)
class RNIconImage: RCTViewManager {
  
  override func view() -> NSView! {    
    return CustomRNIconImage()
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
