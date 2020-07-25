
//  Hotkeys.swift
//  spotter-macOS
//
//  Created by Denis Zyulev on 11/07/2020.
//

import Foundation
import HotKey

@objc(Hotkeys)
class Hotkeys: RCTEventEmitter {
  
  private var window: Window!
  
  override init() {
    super.init()
    
    self.window = Window()
  }

  private var hotKey: HotKey? {
    didSet {
      guard let hotKey = hotKey else {
        sendEvent(withName: "onEvent", body: ["value": "Unregistered"])
        return
      }

      sendEvent(withName: "onEvent", body: ["value": "Registered"])

      hotKey.keyDownHandler = { [weak self] in

        self?.sendEvent(withName: "onEvent", body: ["value": "Pressed at \(Date())"])

//        self?.togglePanel()
        print("OPEN PANEL")
        self?.window.togglePanel()

      }
    }
  }

  @objc
  func emit() {
    // Register hotkey
    hotKey = HotKey(keyCombo: KeyCombo(key: .s, modifiers: [.option]))

    sendEvent(withName: "onEvent", body: ["value": 123])
  }

  override func supportedEvents() -> [String]! {
    return ["onEvent"]
  }

}
