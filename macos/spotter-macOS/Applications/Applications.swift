//
//  Applications.swift
//  spotter-macOS
//
//  Created by Denis Zyulev on 28/07/2020.
//

import Foundation
import ShellOut

@objc(Applications)
class Applications: RCTEventEmitter {

  @objc
  func getAll(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Any {
    let fileManager = FileManager()

    guard let applicationsFolderUrl = try? FileManager.default.url(for: .applicationDirectory, in: .localDomainMask, appropriateFor: nil, create: false) else { return [] }

    let applicationUrls = try! fileManager.contentsOfDirectory(at: applicationsFolderUrl , includingPropertiesForKeys: [], options: [FileManager.DirectoryEnumerationOptions.skipsPackageDescendants, FileManager.DirectoryEnumerationOptions.skipsSubdirectoryDescendants])

    guard let systemApplicationsFolderUrl = try? FileManager.default.url(for: .applicationDirectory, in: .systemDomainMask, appropriateFor: nil, create: false) else { return [] }

    let utilitiesFolderUrl = NSURL.init(string: "\(systemApplicationsFolderUrl.path)/Utilities")! as URL

    guard let utilitiesUrls = try? fileManager.contentsOfDirectory(at: utilitiesFolderUrl, includingPropertiesForKeys: [], options: [FileManager.DirectoryEnumerationOptions.skipsPackageDescendants, FileManager.DirectoryEnumerationOptions.skipsSubdirectoryDescendants]) else { return [] }

    let urls = applicationUrls + utilitiesUrls

    var applications = [Any]()

    for url in urls {
        if fileManager.isExecutableFile(atPath: url.path) {
            guard let mdi = NSMetadataItem(url: url) else { continue }

          let option = [
            "title": mdi.value(forAttribute: kMDItemDisplayName as String) as! String,
            "path": mdi.value(forAttribute: kMDItemPath as String) as! String
          ]

          applications.append(option)
        }
    }

    return resolve(applications)
  }
  
  @objc
  func open(_ path: String) {
    NSWorkspace.shared.open(URL(fileURLWithPath: path))
  }
  
  @objc
  func setDimensions(_ appName: String, x: String, y: String, width: String, height: String) {
    if !self.readPrivileges(prompt: true) {
      //  SUBSCRIBE
      DistributedNotificationCenter.default().addObserver(forName: NSNotification.Name("com.apple.accessibility.api"), object: nil, queue: nil) { foo in
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
          print("00000000000000000000000000000000000000", foo)
          self.setDimensions(appName, x: x, y: y, width: width, height: height)
          DistributedNotificationCenter.default().removeObserver(self)
        }
      }
      return
    }
    
    
    let type = CGWindowListOption.optionOnScreenOnly
    let windowList = CGWindowListCopyWindowInfo(type, kCGNullWindowID) as NSArray? as? [[String: AnyObject]]

    for entry  in windowList!
    {
      let owner = entry[kCGWindowOwnerName as String] as! String
      _ = entry[kCGWindowBounds as String] as? [String: Int]
      let pid = entry[kCGWindowOwnerPID as String] as? Int32

      if owner == "Terminal"
      {
        let appRef = AXUIElementCreateApplication(pid!);  //TopLevel Accessability Object of PID

        var value: AnyObject?
        _ = AXUIElementCopyAttributeValue(appRef, kAXWindowsAttribute as CFString, &value)

        if let windowList = value as? [AXUIElement]
        { print ("windowList #\(windowList)")
          if windowList.first != nil
          {
            var position : CFTypeRef
            var size : CFTypeRef
            var  newPoint = CGPoint(x: 0, y: 0)
            var newSize = CGSize(width: 800, height: 800)

            position = AXValueCreate(AXValueType(rawValue: kAXValueCGPointType)!,&newPoint)!;
            AXUIElementSetAttributeValue(windowList.first!, kAXPositionAttribute as CFString, position);

            size = AXValueCreate(AXValueType(rawValue: kAXValueCGSizeType)!,&newSize)!;
            AXUIElementSetAttributeValue(windowList.first!, kAXSizeAttribute as CFString, size);
          }
        }
      }
    }
    
    
//    let type = CGWindowListOption.optionOnScreenOnly
//    let windowList = CGWindowListCopyWindowInfo(type, kCGNullWindowID) as NSArray? as? [[String: AnyObject]]
//
//    for entry  in windowList!
//    {
//      let owner = entry[kCGWindowOwnerName as String] as! String
//      _ = entry[kCGWindowBounds as String] as? [String: Int]
//      let pid = entry[kCGWindowOwnerPID as String] as? Int32
//
//      if owner == appName
//      {
//        let appRef = AXUIElementCreateApplication(pid!);  //TopLevel Accessability Object of PID
//
//        var value: AnyObject?
//        _ = AXUIElementCopyAttributeValue(appRef, kAXWindowsAttribute as CFString, &value)
//
//        if let windowList = value as? [AXUIElement]
//        {
//          if windowList.first != nil
//          {
//            var position : CFTypeRef
//            var size : CFTypeRef
//            var  newPoint = CGPoint(x: CGFloat(truncating: NumberFormatter().number(from: x)!), y: CGFloat(truncating: NumberFormatter().number(from: y)!))
//            var newSize = CGSize(width: CGFloat(truncating: NumberFormatter().number(from: width)!), height: CGFloat(truncating: NumberFormatter().number(from: height)!))
//
//            position = AXValueCreate(AXValueType(rawValue: kAXValueCGPointType)!,&newPoint)!;
//            AXUIElementSetAttributeValue(windowList.first!, kAXPositionAttribute as CFString, position);
//
//            size = AXValueCreate(AXValueType(rawValue: kAXValueCGSizeType)!,&newSize)!;
//            AXUIElementSetAttributeValue(windowList.first!, kAXSizeAttribute as CFString, size);
//          }
//        }
//      }
//    }
  }

  override func supportedEvents() -> [String]! {
    return []
  }
  
  private func readPrivileges(prompt: Bool) -> Bool {
    let options: NSDictionary = [kAXTrustedCheckOptionPrompt.takeRetainedValue() as NSString: prompt]
    let status = AXIsProcessTrustedWithOptions(options)
    return status
  }

}
