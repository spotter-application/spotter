import Foundation
import ShellOut
import Magnet
import Carbon

@objc(StatusBar)
class StatusBar: RCTEventEmitter {
  
  let appDelegate = NSApplication.shared.delegate as! AppDelegate
  
  @objc
  func changeTitle(_ title: NSString) -> Void {
    DispatchQueue.main.async {
      self.appDelegate.setStatusBarTitle(title)
    }
  }
  
  override func supportedEvents() -> [String]! {
    return []
  }
  
  @objc override static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
}
