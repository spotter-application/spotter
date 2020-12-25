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

enum Events {
  static let press: String = "onPress"
  static let esc: String = "onEsc"
  static let upArrow: String = "onUpArrow"
  static let downArrow: String = "onDownArrow"
}

import Foundation
import HotKey
import ShellOut

@objc(GlobalHotkey)
class GlobalHotkey: RCTEventEmitter {
  
  override init() {
    super.init()
    
    NSEvent.addLocalMonitorForEvents(matching: .keyDown, handler: keyDown)
  }
  
  func keyDown(with event: NSEvent) -> NSEvent? {
    let keyCode = event.keyCode

    if keyCode == KeyCode.esc {
      self.sendEvent(withName: Events.esc, body: keyCode)
      return nil
    }
    
    if keyCode == KeyCode.upArrow {
      self.sendEvent(withName: Events.upArrow, body: keyCode)
      return nil
    }
    
    if keyCode == KeyCode.downArrow {
      self.sendEvent(withName: Events.downArrow, body: keyCode)
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
        self?.sendEvent(withName: Events.press, body: "")
      }
    }
  }

  @objc
  func register(_ key: NSString, withModifier modifier: NSString) {
    hotKey = HotKey(keyCombo: KeyCombo(key: .space, modifiers: [.option]))
  }

  override func supportedEvents() -> [String]! {
    return [Events.press, Events.esc, Events.upArrow, Events.downArrow]
  }

}
