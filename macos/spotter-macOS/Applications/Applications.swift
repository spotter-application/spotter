import Foundation

@objc(Applications)
class Applications: RCTEventEmitter {
  
  @objc
  func getRunningList(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    let workspace = NSWorkspace.shared
    let apps = workspace.runningApplications.filter{  $0.activationPolicy == .regular }
    
    var runningApps = [Any]()
    
    for app in apps {
      let data = [
        "appName": app.localizedName,
      ];

      runningApps.append(data)
    }
    
    resolve(runningApps)
  }
  
  @objc
  func getDimensions(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    if !self.readPrivileges(prompt: true) {
      //  SUBSCRIBE
      DistributedNotificationCenter.default().addObserver(forName: NSNotification.Name("com.apple.accessibility.api"), object: nil, queue: nil) { _ in
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
          DistributedNotificationCenter.default().removeObserver(self)
        }
      }
      return
    }

    let type = CGWindowListOption.optionOnScreenOnly
    let windowList = CGWindowListCopyWindowInfo(type, kCGNullWindowID) as NSArray? as? [[String: AnyObject]]

    var dimenstions = [Any]()
    
    for entry  in windowList!
    {
      let pid = entry[kCGWindowOwnerPID as String] as? Int32
      let appRef = AXUIElementCreateApplication(pid!);

      var value: AnyObject?
      _ = AXUIElementCopyAttributeValue(appRef, kAXWindowsAttribute as CFString, &value)
      
      if let windowList = value as? [AXUIElement]
      {
        if windowList.first != nil
        {
          
          let owner = entry[kCGWindowOwnerName as String] as! String
          let currentBounds = entry[kCGWindowBounds as String] as! NSDictionary
          let data = [
            "appName": owner,
            "x": currentBounds["X"],
            "y": currentBounds["Y"],
            "width": currentBounds["Width"],
            "height": currentBounds["Height"]
          ]

          dimenstions.append(data)
        }
      }
    }
    
    resolve(dimenstions)
  }

  @objc
  func setDimensions(_ appName: String, x: String, y: String, width: String, height: String) {
    if !self.readPrivileges(prompt: true) {
      //  SUBSCRIBE
      DistributedNotificationCenter.default().addObserver(forName: NSNotification.Name("com.apple.accessibility.api"), object: nil, queue: nil) { _ in
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
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

      if owner == appName
      {
        let appRef = AXUIElementCreateApplication(pid!);  //TopLevel Accessability Object of PID

        var value: AnyObject?
        _ = AXUIElementCopyAttributeValue(appRef, kAXWindowsAttribute as CFString, &value)

        if let windowList = value as? [AXUIElement]
        {
          if windowList.first != nil
          {
            var position : CFTypeRef
            var size : CFTypeRef
            var  newPoint = CGPoint(x: CGFloat(truncating: NumberFormatter().number(from: x)!), y: CGFloat(truncating: NumberFormatter().number(from: y)!))
            var newSize = CGSize(width: CGFloat(truncating: NumberFormatter().number(from: width)!), height: CGFloat(truncating: NumberFormatter().number(from: height)!))

            position = AXValueCreate(AXValueType(rawValue: kAXValueCGPointType)!,&newPoint)!;
            AXUIElementSetAttributeValue(windowList.first!, kAXPositionAttribute as CFString, position);

            size = AXValueCreate(AXValueType(rawValue: kAXValueCGSizeType)!,&newSize)!;
            AXUIElementSetAttributeValue(windowList.first!, kAXSizeAttribute as CFString, size);
          }
        }
      }
    }
  }

  override func supportedEvents() -> [String]? {
    return []
  }
  
  private func readPrivileges(prompt: Bool) -> Bool {
    let options: NSDictionary = [kAXTrustedCheckOptionPrompt.takeRetainedValue() as NSString: prompt]
    let status = AXIsProcessTrustedWithOptions(options)
    return status
  }
  
  @objc override static func requiresMainQueueSetup() -> Bool {
    return false
  }

}
