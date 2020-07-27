//
//  Shell.swift
//  spotter-macOS
//
//  Created by Denis Zyulev on 27/07/2020.
//


import Foundation
import ShellOut

@objc(Shell)
class Shell: RCTEventEmitter {

  @objc
  func execute(_ command: String) {
    do {
      try shellOut(to: command)
    } catch {
      let error = error as! ShellOutError
      print(error.message)
      print(error.output)
    }
  }
  

  override func supportedEvents() -> [String]! {
    return []
  }

}
