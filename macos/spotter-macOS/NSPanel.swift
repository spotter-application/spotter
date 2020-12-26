//
//  NSPanel.swift
//  spotter-macOS
//
//  Created by Denis on 26.12.20.
//

import Foundation

class NSPanelExt: NSPanel {
  
  override var canBecomeKey :Bool {return true}
  override var canBecomeMain :Bool {return true}
  override var acceptsFirstResponder :Bool {return true}

  override func keyDown(with: NSEvent) {
    super.keyDown(with: with)
    print("keyCode is \(with.keyCode)")
  }
}
