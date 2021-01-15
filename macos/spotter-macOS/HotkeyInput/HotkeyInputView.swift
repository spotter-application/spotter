import Foundation
import KeyHolder
import Magnet

class HotkeyInputView: RecordView, RecordViewDelegate {
  
  @objc var onChangeHotkey: RCTDirectEventBlock?

  func recordViewShouldBeginRecording(_ recordView: RecordView) -> Bool {
    return true
  }
  
  func recordView(_ recordView: RecordView, canRecordKeyCombo keyCombo: KeyCombo) -> Bool {
    return true
  }
  
  func recordView(_ recordView: RecordView, didChangeKeyCombo keyCombo: KeyCombo?) {
    self.onChangeHotkey!([
      "keyCode": keyCombo?.QWERTYKeyCode as Any,
      "modifiers": keyCombo?.modifiers as Any,
      "doubledModifiers": keyCombo?.doubledModifiers as Any,
    ]);
  }
  
  func recordViewDidEndRecording(_ recordView: RecordView) {
  }
  
  @objc func setHotkey(_ val: NSDictionary) {
    if let keyCode = (val["keyCode"] as! Int?) {
      let keyCombo = val["doubledModifiers"] as! Bool
        ? KeyCombo(doubledCarbonModifiers: val["modifiers"] as! Int)
        : KeyCombo(QWERTYKeyCode: keyCode, carbonModifiers: val["modifiers"] as! Int)

      self.keyCombo = keyCombo
    } else {
      
    }


  }
  
  override init(frame: CGRect) {
    super.init(frame: frame)
    
    self.delegate = self
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
}
