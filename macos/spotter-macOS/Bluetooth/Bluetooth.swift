import Foundation
import IOBluetooth

@objc(NativeBluetooth)
class NativeBluetooth: RCTEventEmitter {
  
  func pairedDevices() -> [NSDictionary] {
    guard let devices = IOBluetoothDevice.pairedDevices() else {
      return []
    }
    
    var result: [NSDictionary] = []

    for item in devices {
      if let device = item as? IOBluetoothDevice {
        if (device.name != nil) {
          result.append([
            "name": device.name as Any,
            "paired": device.isPaired(),
            "connected": device.isConnected(),
            "address": device.addressString as Any,
          ])
        }
      }
    }
    
    return result
  }
  
  @objc
  func getDevices(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    resolve(self.pairedDevices())
  }
  
  @objc
  func connectDevice(_ address: NSString) -> Void {
    guard let devices = IOBluetoothDevice.pairedDevices() else {
      return
    }
    
    for item in devices {
      if let device = item as? IOBluetoothDevice {
        if (device.addressString == address as String) {
          device.openConnection()
        }
      }
    }
  }

  @objc
  func disconnectDevice(_ address: NSString) -> Void {
    guard let devices = IOBluetoothDevice.pairedDevices() else {
      return
    }
    
    for item in devices {
      if let device = item as? IOBluetoothDevice {
        if (device.addressString == address as String) {
          device.closeConnection()
        }
      }
    }
  }
  
  override func supportedEvents() -> [String]! {
    return []
  }
  
  @objc override static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
}
