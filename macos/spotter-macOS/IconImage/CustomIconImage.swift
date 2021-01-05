import Foundation

class CustomRNIconImage: NSImageView {
  
  @objc func setSource(_ val: NSString) {
    let image = NSWorkspace.shared.icon(forFile: val as String)
    self.image = image
  }
  
}
