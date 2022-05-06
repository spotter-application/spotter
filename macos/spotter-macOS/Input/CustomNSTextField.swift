import Foundation

func hexStringToUIColor (hex: NSString) -> NSColor {
    var cString:String = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()

    if (cString.hasPrefix("#")) {
        cString.remove(at: cString.startIndex)
    }

    if ((cString.count) != 6) {
        return NSColor.gray
    }

    var rgbValue:UInt64 = 0
    Scanner(string: cString).scanHexInt64(&rgbValue)

    return NSColor(
        red: CGFloat((rgbValue & 0xFF0000) >> 16) / 255.0,
        green: CGFloat((rgbValue & 0x00FF00) >> 8) / 255.0,
        blue: CGFloat(rgbValue & 0x0000FF) / 255.0,
        alpha: CGFloat(1.0)
    )
}

class CustomNSTextField: NSTextField, NSTextFieldDelegate {
  
  let appDelegate = NSApplication.shared.delegate as! AppDelegate

  @objc var onChangeText: RCTDirectEventBlock?
  @objc var onSubmit: RCTDirectEventBlock?
  @objc var onEscape: RCTDirectEventBlock?
  @objc var onArrowDown: RCTDirectEventBlock?
  @objc var onArrowUp: RCTDirectEventBlock?
  @objc var onCommandKey: RCTDirectEventBlock?
  @objc var onTab: RCTDirectEventBlock?
  @objc var onShiftTab: RCTDirectEventBlock?
  @objc var onShiftEnter: RCTDirectEventBlock?
  @objc var onBackspace: RCTDirectEventBlock?
  
  @objc func setPlaceholder(_ val: NSNumber) {
    self.placeholderString = String(describing: val)
  }

  @objc func setValue(_ val: NSString) {
    let nextVal = String(val)
    if (nextVal == self.stringValue) {
      return
    }
    
    self.stringValue = nextVal
    self.currentEditor()?.moveToEndOfDocument(nil)
  }
  
  @objc func setFontSize(_ val: NSNumber) {
    self.font = NSFont.systemFont(ofSize: CGFloat(truncating: val))
  }
  
  @objc func setBackground(_ val: NSString) {
    self.backgroundColor = hexStringToUIColor(hex: val)
  }

  @objc func setColor(_ val: NSString) {
    let nextColor = hexStringToUIColor(hex: val)
    self.textColor = nextColor

    if let editor = self.currentEditor() as? NSTextView{
      editor.insertionPointColor = nextColor
    }
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
//    self.textColor = NSColor.clear
    self.delegate = self
    
    self.appDelegate.onOpenSpotterCallback = self.onOpenSpotterCallback
    
    // TODO: Find a way to add listener for "command + ," event
    NSEvent.addLocalMonitorForEvents(matching: [.flagsChanged, .keyDown]) {
      return self.hotkeyDown(with: $0)
    }
    
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
    // Cmd + u
    if (event.keyCode == 32 && event.modifierFlags.contains(NSEvent.ModifierFlags.command)) {
      self.onCommandKey!(["key": event.keyCode]);
      return nil
    }
    
    // Cmd + q
    if (event.keyCode == 12 && event.modifierFlags.contains(NSEvent.ModifierFlags.command)) {
      self.onCommandKey!(["key": event.keyCode]);
      return nil
    }
    
    // Cmd + ,
    if (event.keyCode == 43 && event.modifierFlags.contains(NSEvent.ModifierFlags.command)) {
      self.onCommandKey!(["key": event.keyCode]);
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
