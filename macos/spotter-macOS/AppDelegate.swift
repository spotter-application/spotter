import Foundation
import Cocoa

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {
  
  var bridge: RCTBridge!
  var statusBarItem: NSStatusItem!
  var jsCodeLocation: URL!
  var panel: NSPanel!
  var settingsPanel: NSPanel!
  var isActiveSettingsPanel = false

  func applicationDidFinishLaunching(_ aNotification: Notification) {
    #if DEBUG
    jsCodeLocation = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackResource:nil)
    #else
    jsCodeLocation = Bundle.main.url(forResource: "main", withExtension: "jsbundle")!
    #endif
    
    self.bridge = RCTBridge(bundleURL: jsCodeLocation, moduleProvider: nil, launchOptions: nil)
    #if RCT_DEV
    self.bridge?.module(for: RCTDevLoadingView.self)
    #endif
    
    self.setupMenubar()
    self.setupPanel()
    self.setupWindow()
  }
  
  func setStatusBarTitle(_ title: NSString) {
    if (title.length == 0) {
      self.statusBarItem.button?.title = ""
      
      DispatchQueue.main.async {
        self.statusBarItem.button?.image = NSImage(named: NSImage.Name("Icon"))
      }
    }

    self.statusBarItem.button?.title = title as String
    self.statusBarItem.button?.image = nil
  }
  
  private func setupMenubar() {
    let statusBar = NSStatusBar.system
    self.statusBarItem = statusBar.statusItem(withLength: NSStatusItem.variableLength)
    self.statusBarItem.button?.image = NSImage(named: NSImage.Name("Icon"))
    
    let statusBarMenu = NSMenu(title: "Cap Status Bar Menu")
    statusBarItem.menu = statusBarMenu
    statusBarMenu.addItem(
      withTitle: "Toggle Spotter",
      action: #selector(AppDelegate.togglePanel),
      keyEquivalent: "")
    statusBarMenu.addItem(
      withTitle: "Settings",
      action: #selector(AppDelegate.openSettings),
      keyEquivalent: ",")
    statusBarMenu.addItem(
      withTitle: "Quit",
      action: #selector(AppDelegate.Quitapp),
      keyEquivalent: "q")
  }
  
  private func setupWindow() {
    let width = 600
    let height = 500
  
    settingsPanel = NSPanel(contentRect: NSRect(x: 0, y: 0, width: width, height: height), styleMask: [
      .nonactivatingPanel,
      .closable,
      .titled,
      .resizable,
    ], backing: .buffered, defer: true)
    settingsPanel.title = "Settings"
    settingsPanel.level = .mainMenu
//    let rootView = RCTRootView(bundleURL: jsCodeLocation, moduleName: "settings", initialProperties: nil, launchOptions: nil)
    let rootView = RCTRootView(bridge: self.bridge, moduleName: "settings", initialProperties: nil)
    let rootViewController = NSViewController()
    rootViewController.view = rootView
    
    settingsPanel.contentViewController = rootViewController
    
    settingsPanel.contentMinSize = NSSize(width: width, height: height)
    
    let newSize = NSSize(width: width, height: height)
    guard var frame = settingsPanel.contentView?.window?.frame else { return }
    frame.size = newSize
    settingsPanel.contentView?.setFrameSize(newSize)
    settingsPanel.contentView?.window?.setFrame(frame, display: true)
  }
  
  @objc func openSettings() {
    settingsPanel.makeKeyAndOrderFront(nil)
    settingsPanel.center()
  }
  
  @objc func closeSettings() {
    settingsPanel.close()
  }
  
  private func setupPanel() {
    let width = 500
    let height = 300
    
    panel = NSPanel(contentRect: NSRect(x: 0, y: 0, width: width, height: height), styleMask: [
      .nonactivatingPanel,
      .titled,
      .fullSizeContentView,
    ], backing: .buffered, defer: true)
    panel.titleVisibility = .hidden
    panel.level = .mainMenu
    panel.titlebarAppearsTransparent = true
    
    let rootView = RCTRootView(bridge: self.bridge, moduleName: "spotter", initialProperties: nil)
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
    if (!settingsPanel.isVisible) {
      panel.makeKeyAndOrderFront(nil)
      panel.center()
    }
  }
  
  @objc func closePanel() {
    panel.close()
  }
  
  @objc func togglePanel() {
    if panel.isVisible {
      self.closePanel()
    } else {
      self.openPanel()
    }
  }

  @objc func Quitapp() {
    NSApp.terminate(self)
  }
  
}
