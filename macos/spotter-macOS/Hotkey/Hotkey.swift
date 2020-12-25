//
//  Hotkey.swift
//  spotter-macOS
//
//  Created by Denis on 25.12.20.
//

enum KeyCode {
  static let esc: UInt16 = 53
  static let enter: UInt16 = 36
  static let upArrow: UInt16 = 126
  static let downArrow: UInt16 = 125
}

import Foundation
import HotKey
import ShellOut

@objc(GlobalHotkey)
class GlobalHotkey: RCTEventEmitter {
  
  let eventName = "onPress"
  let escEventName = "onEsc"
  
  override init() {
    super.init()
    
    NSEvent.addLocalMonitorForEvents(matching: .keyDown, handler: keyDown)
  }
  
  func keyDown(with event: NSEvent) -> NSEvent? {
    let keyCode = event.keyCode

    if keyCode == KeyCode.esc {
      self.sendEvent(withName: self.escEventName, body: keyCode)
      return nil
    }

    return event
  }

  private var hotKey: HotKey? {
    didSet {
      
      guard let hotKey = hotKey else {
        return
      }

      hotKey.keyDownHandler = { [weak self] in
        self?.sendEvent(withName: self?.eventName, body: "")
      }
    }
  }

  @objc
  func register(_ key: NSString, withModifier modifier: NSString) {
    hotKey = HotKey(keyCombo: KeyCombo(key: .space, modifiers: [.option]))
  }

  override func supportedEvents() -> [String]! {
    return [eventName, escEventName]
  }

}
