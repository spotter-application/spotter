
//  Panel.swift
//  spotter-macOS
//
//  Created by Denis Zyulev on 11/07/2020.
//

import Foundation
import ShellOut

@objc(Panel)
class Panel: RCTEventEmitter {
  
  let appDelegate = NSApplication.shared.delegate as! AppDelegate
  
  @objc func toggle() {
    DispatchQueue.main.async {
      self.appDelegate.togglePanel()
    }
  }

  override func supportedEvents() -> [String]! {
    return []
  }

}

