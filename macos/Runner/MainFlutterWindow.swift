import Cocoa
import FlutterMacOS

class MainFlutterWindow: NSWindow {
  let width = 600
  let height = 500
  
  override func awakeFromNib() {
    let flutterViewController = FlutterViewController.init()
    let windowFrame = self.frame
    self.contentViewController = flutterViewController
    self.setFrame(windowFrame, display: true)
    self.styleMask = [
      .nonactivatingPanel,
      .closable,
      .titled,
      .resizable,
    ]
    self.makeKeyAndOrderFront(nil)
    self.isMovableByWindowBackground = false
    self.styleMask.remove(.titled)
    self.level = .mainMenu
    self.isOpaque = false
    self.backgroundColor = NSColor.clear
    
    RegisterGeneratedPlugins(registry: flutterViewController)

    super.awakeFromNib()
  }
}
