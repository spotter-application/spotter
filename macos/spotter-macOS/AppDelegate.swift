//Author: Oscar Franco, created on: 23.05.20

import Foundation
import Cocoa
import HotKey

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {
  var popover: NSPopover!
  var bridge: RCTBridge!
  var statusBarItem: NSStatusItem!
  var jsCodeLocation: URL!
  var panel: NSPanel!
  var isActivePanel = false

  func applicationDidFinishLaunching(_ aNotification: Notification) {

    #if DEBUG
    self.jsCodeLocation = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackResource:nil)
    #else
    self.jsCodeLocation = Bundle.main.url(forResource: "main", withExtension: "jsbundle")!
    #endif
    
    
//    popover = NSPopover()
//    popover.contentSize = NSSize(width: 500, height: 300)
//    popover.animates = false
//    popover.behavior = .transient
//    popover.contentViewController = rootViewController
    
    self.setupPanel()

    hotKey = HotKey(keyCombo: KeyCombo(key: .space, modifiers: [.option]))

    
    //Menu Bar Item
    let statusBar = NSStatusBar.system
        statusBarItem = statusBar.statusItem(
            withLength: NSStatusItem.squareLength)
        statusBarItem.button?.title = "Find"//Should change to spotter logo in future
        let statusBarMenu = NSMenu(title: "Cap Status Bar Menu")
        statusBarItem.menu = statusBarMenu
        statusBarMenu.addItem(
            withTitle: "Open Spotter",
            action: #selector(AppDelegate.togglePanel),
            keyEquivalent: "")
        statusBarMenu.addItem(
            withTitle: "Preferences",
            action: #selector(AppDelegate.togglePopover),
            keyEquivalent: "")
        statusBarMenu.addItem(
            withTitle: "Quit",
            action: #selector(AppDelegate.Quitapp),
            keyEquivalent: "q")
    //End Menu Bar Item
  }
  
  private var hotKey: HotKey? {
    didSet {
      guard let hotKey = hotKey else {
        return
      }

      hotKey.keyDownHandler = { [weak self] in
        self?.togglePanel()
      }
    }
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
  
  @objc func togglePanel() {
    if isActivePanel {
      panel.close()
      isActivePanel = false
      print("CLOSE PANEL")
//      self.reset()
    } else {
      panel.makeKeyAndOrderFront(nil)
      panel.center()
      isActivePanel = true
      
      print("OPEN PANEL")
      
//      self.updateViewSize()
    }
  }
  
  
  @objc func togglePopover(_ sender: AnyObject?) {
       if let button = self.statusBarItem.button {
           if self.popover.isShown {
               self.popover.performClose(sender)
           } else {
               self.popover.show(relativeTo: button.bounds, of: button, preferredEdge: NSRectEdge.minY)

               self.popover.contentViewController?.view.window?.becomeKey()
           }
       }
   }
  
  
  //Menu bar functions
   @objc func openspotter() {
        print("open")//This should open spotter
    }
    @objc func openpreferences() {
        print("Preferences")//This should open the preferences window
    }
    @objc func Quitapp() {
        NSApp.terminate(self)//Quit the app
    }
  }

