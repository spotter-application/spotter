import Foundation
import Cocoa

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {
  
  var bridge: RCTBridge!
  var statusBarItem: NSStatusItem!
  var panel: NSPanelExt!
  var isActivePanel = false

  func applicationDidFinishLaunching(_ aNotification: Notification) {
    self.setupMenubar()

    self.setupPanel()
  }
  
  private func setupMenubar() {
    let statusBar = NSStatusBar.system
        statusBarItem = statusBar.statusItem(
            withLength: NSStatusItem.squareLength)
        statusBarItem.button?.title = "S"
        let statusBarMenu = NSMenu(title: "Cap Status Bar Menu")
        statusBarItem.menu = statusBarMenu
        statusBarMenu.addItem(
            withTitle: "Toggle Spotter",
            action: #selector(AppDelegate.togglePanel),
            keyEquivalent: "")
        statusBarMenu.addItem(
            withTitle: "Quit",
            action: #selector(AppDelegate.Quitapp),
            keyEquivalent: "q")
  }
  
  private func setupPanel() {
    let width = 500
    let height = 300
    var jsCodeLocation: URL
    
    #if DEBUG
    jsCodeLocation = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackResource:nil)
    #else
    jsCodeLocation = Bundle.main.url(forResource: "main", withExtension: "jsbundle")!
    #endif
    
    panel = NSPanelExt(contentRect: NSRect(x: 0, y: 0, width: width, height: height), styleMask: [
        .nonactivatingPanel,
        .titled,
        .fullSizeContentView,
    ], backing: .buffered, defer: true)
    panel.titleVisibility = .hidden
    panel.level = .mainMenu
    panel.titlebarAppearsTransparent = true
    
    
    let rootView = RCTRootView(bundleURL: jsCodeLocation, moduleName: "spotter", initialProperties: nil, launchOptions: nil)
    let rootViewController = NSViewController()
    rootViewController.view = rootView
    panel.contentViewController = rootViewController
    
    let newSize = NSSize(width: width, height: height)
    guard var frame = panel.contentView?.window?.frame else { return }
    frame.size = newSize
    panel.contentView?.setFrameSize(newSize)
    panel.contentView?.window?.setFrame(frame, display: true)
    panel.contentView?.window?.backgroundColor = NSColor.clear
  }
  
  @objc func openPanel() {
    panel.makeKeyAndOrderFront(nil)
    panel.center()
    isActivePanel = true
  }
  
  @objc func closePanel() {
    panel.close()
    isActivePanel = false
  }
  
  @objc func togglePanel() {
    if isActivePanel {
      self.closePanel()
    } else {
      self.openPanel()
    }
  }

  @objc func Quitapp() {
    NSApp.terminate(self)
  }
  
}
