
//  Panel.swift
//  spotter-macOS
//
//  Created by Denis Zyulev on 11/07/2020.
//

import Foundation
import ShellOut
import HotKey

@objc(Panel)
class Panel: RCTEventEmitter {
  
  let appDelegate = NSApplication.shared.delegate as! AppDelegate
  
  override init() {
    super.init()
    
//    NSEvent.addLocalMonitorForEvents(matching: .keyDown, handler: onPanelKeyDown)
    hotKey = HotKey(keyCombo: KeyCombo(key: .escape, modifiers: []))
  }    
  
  private var hotKey: HotKey? {
    didSet {
      
      guard let hotKey = hotKey else {
        return
      }

      hotKey.keyDownHandler = {
//        self.sendEvent(withName: Events.press, body: "")
        print("TEST321123")
      }
    }
  }
  
  func onPanelKeyDown(with event: NSEvent) -> NSEvent? {
    let keyCode = event.keyCode

    if keyCode == KeyCode.esc {
      print("ESC!")
      self.sendEvent(withName: Events.esc, body: keyCode)
    }
    
    if keyCode == KeyCode.upArrow {
      self.sendEvent(withName: Events.upArrow, body: keyCode)
    }
    
    if keyCode == KeyCode.downArrow {
      self.sendEvent(withName: Events.downArrow, body: keyCode)
    }

    return event
  }
  
  @objc func open() {
    DispatchQueue.main.async {
      self.appDelegate.openPanel()
    }
  }
  
  @objc func close() {
    DispatchQueue.main.async {
      self.appDelegate.closePanel()
    }
  }
  
  @objc func toggle() {
    DispatchQueue.main.async {
      self.appDelegate.togglePanel()
    }
  }

  override func supportedEvents() -> [String]! {
    return [Events.esc, Events.upArrow, Events.downArrow]
  }
  
  @objc override static func requiresMainQueueSetup() -> Bool {
    return false
  }

}
