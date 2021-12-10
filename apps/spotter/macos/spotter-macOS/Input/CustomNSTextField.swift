import Foundation

class CustomNSTextField: NSTextField, NSTextFieldDelegate {
  
  let appDelegate = NSApplication.shared.delegate as! AppDelegate

  @objc var onChangeText: RCTDirectEventBlock?
  @objc var onSubmit: RCTDirectEventBlock?
  @objc var onEscape: RCTDirectEventBlock?
  @objc var onArrowDown: RCTDirectEventBlock?
  @objc var onArrowUp: RCTDirectEventBlock?
  @objc var onCommandComma: RCTDirectEventBlock?
  @objc var onTab: RCTDirectEventBlock?
  @objc var onShiftTab: RCTDirectEventBlock?
  @objc var onShiftEnter: RCTDirectEventBlock?
  @objc var onBackspace: RCTDirectEventBlock?
  
  @objc func setPlaceholder(_ val: NSNumber) {
    self.placeholderString = String(describing: val)
  }

  @objc func setValue(_ val: NSNumber) {
    self.stringValue = String(describing: val)
  }
  
  @objc func setFontSize(_ val: NSNumber) {
    self.font = NSFont.systemFont(ofSize: CGFloat(truncating: val))
  }
  
  @objc func setDisabled(_ val: Bool) {
    self.isEnabled = !val
    self.becomeFirstResponder()
  }
  
  override init(frame: CGRect) {
    super.init(frame: frame)

    self.stringValue = ""
    self.isBezeled = false
    self.isBordered = false
    self.focusRingType = NSFocusRingType.none
    self.font = NSFont.systemFont(ofSize: 26)
    self.textColor = NSColor.clear
    
    self.delegate = self
    
    // TODO: Find a way to add listener for "command + ," event
    NSEvent.addLocalMonitorForEvents(matching: [.flagsChanged, .keyDown]) {
      return self.hotkeyDown(with: $0)
    }
    
    self.appDelegate.onOpenSpotterCallback = self.onOpenSpotterCallback
    
    /* OnEscape event on click outside */
    NSEvent.addGlobalMonitorForEvents(matching: [
      NSEvent.EventTypeMask.leftMouseDown,
      NSEvent.EventTypeMask.rightMouseDown,
      NSEvent.EventTypeMask.otherMouseDown,
    ]) { (event: NSEvent) -> Void in
      
      if (self.appDelegate.spotterPanel.isVisible) {
        self.onEscape!(["text": ""])
      }
    }
  }
  
  func onOpenSpotterCallback() -> Void {
    self.becomeFirstResponder()
  }
  
  func hotkeyDown(with event: NSEvent) -> NSEvent? {
    // Command + Comma
    if (event.keyCode == 43 && event.modifierFlags.contains(NSEvent.ModifierFlags.command)) {
      self.onCommandComma!(["text": self.stringValue]);
      return nil
    }
    
    // Shift + Tab
    if (event.keyCode == 48 && event.modifierFlags.contains(NSEvent.ModifierFlags.shift)) {
      self.onShiftTab!(["text": self.stringValue]);
      return nil
    }
    
    // Shift + Enter
    if (event.keyCode == 13 && event.modifierFlags.contains(NSEvent.ModifierFlags.shift)) {
      self.onShiftEnter!(["text": self.stringValue]);
      return nil
    }

    return event
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  func controlTextDidChange(_ obj: Notification) {
    let textField = obj.object as! NSTextField
    
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
        self.onTab!(["text": self.stringValue])
        return true
      } else if (commandSelector == #selector(NSResponder.cancelOperation(_:))) {
        // ESCAPE key
        self.onEscape!(["text": self.stringValue]);
        return true
      } else if (commandSelector == #selector(NSResponder.moveDown(_:))) {
        // DOWN_ARROW key
        self.onArrowDown!(["text": self.stringValue])
        return true
      } else if (commandSelector == #selector(NSResponder.moveUp(_:))) {
        // UP_ARROW key
        self.onArrowUp!(["text": self.stringValue])
        return true
      } else if (commandSelector == #selector(NSResponder.deleteBackward(_:))) {
        // BACKSPACE key
        self.onBackspace!(["text": self.stringValue])
        return false
      }

      return false
  }
  
  
}
