import Foundation
import Magnet
import Carbon

@objc(NativeClipboard)
class NativeClipboard: RCTEventEmitter {

  @objc
  func setValue(_ value: NSString) -> Void {
    NSPasteboard.general.clearContents()
    NSPasteboard.general.setString(value as String, forType: .string)
  }
  
  @objc
  func getValue(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    resolve(NSPasteboard.general.string(forType: .string))
  }
  
  override func supportedEvents() -> [String]! {
    return []
  }
  
  @objc override static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
}
