import Foundation

@objc(Shell)
class Shell: RCTEventEmitter {

  @objc
  func execute(_ command: String,
                      resolver resolve: RCTPromiseResolveBlock,
                      rejecter reject: RCTPromiseRejectBlock) -> Void {
    do {
      let output = try shellOut(to: command, at: "/")
      resolve(output)
    } catch {
      let error = error as! ShellOutError
      print(error.message)
      print(error.output)
      reject("code", error.message, error)
    }
  }

  override func supportedEvents() -> [String]? {
    return []
  }

  @objc override static func requiresMainQueueSetup() -> Bool {
    return false
  }

}
