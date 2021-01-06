import Foundation
import ShellOut

@objc(Panel)
class Panel: RCTEventEmitter {

  let appDelegate = NSApplication.shared.delegate as! AppDelegate

  override init() {
    super.init()
  }

  @objc func open() {
    DispatchQueue.main.async {
      self.appDelegate.openSpotter()
    }
  }

  @objc func close() {
    DispatchQueue.main.async {
      self.appDelegate.closeSpotter()
    }
  }

  @objc func toggle() {
    DispatchQueue.main.async {
      self.appDelegate.toggleSpotter()
    }
  }
  
  @objc func openSettings() {
    DispatchQueue.main.async {
      self.appDelegate.openSettings()
    }
  }

  override func supportedEvents() -> [String]! {
    return []
  }

  @objc override static func requiresMainQueueSetup() -> Bool {
    return false
  }

}
