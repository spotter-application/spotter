//
//  CustomNSTextField.swift
//  spotter-macOS
//
//  Created by Denis on 29.12.20.
//

import Foundation

class CustomNSTextField: NSTextField, NSTextFieldDelegate {

  @objc var onChangeText: RCTDirectEventBlock?
  @objc var onSubmit: RCTDirectEventBlock?
  @objc var onEscape: RCTDirectEventBlock?
  @objc var onArrowDown: RCTDirectEventBlock?
  @objc var onArrowUp: RCTDirectEventBlock?
  
  @objc func setPlaceholder(_ val: NSNumber) {
    self.placeholderString = String(describing: val)
  }

  @objc func setValue(_ val: NSNumber) {
    self.stringValue = String(describing: val)
  }
  
  override init(frame: CGRect) {
    super.init(frame: frame)

    self.isBezeled = false
    self.isBordered = false
    self.focusRingType = NSFocusRingType.none
    self.font = NSFont.systemFont(ofSize: 26)
    
    self.delegate = self
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  func controlTextDidChange(_ obj: Notification) {
    let textField = obj.object as! NSTextField
    print(textField.stringValue)
    
    if ((self.onChangeText) != nil) {
      self.onChangeText!(["text": textField.stringValue]);
    }
  }
  
  func control(_ control: NSControl, textView: NSTextView, doCommandBy commandSelector: Selector) -> Bool {
      if (commandSelector == #selector(NSResponder.insertNewline(_:))) {
        // ENTER
        self.onSubmit!(["text": self.stringValue]);
        return true
      } else if (commandSelector == #selector(NSResponder.insertTab(_:))) {
        // TAB key
        self.onArrowDown!(["text": self.stringValue])
        return true
      } else if (commandSelector == #selector(NSResponder.cancelOperation(_:))) {
        // ESCAPE key
        self.onEscape!(["text": self.stringValue]);
        return true
      } else if (commandSelector == #selector(NSResponder.moveDown(_:))) {
        // DOWN_ARROW key
        self.onArrowUp!(["text": self.stringValue])
        return true
      } else if (commandSelector == #selector(NSResponder.moveUp(_:))) {
        // UP_ARROW key
        self.onArrowDown!(["text": self.stringValue])
        return true
      }

      return false
  }
  
  
}
