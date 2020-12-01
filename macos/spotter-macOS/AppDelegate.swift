//Author: Oscar Franco, created on: 23.05.20

import Foundation
import Cocoa

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {
  var popover: NSPopover!
  var bridge: RCTBridge!
  var statusBarItem: NSStatusItem!

  func applicationDidFinishLaunching(_ aNotification: Notification) {
    let jsCodeLocation: URL
    #if DEBUG
    jsCodeLocation = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackResource:nil)
    #else
    jsCodeLocation = Bundle.main.url(forResource: "main", withExtension: "jsbundle")!
    #endif
    let rootView = RCTRootView(bundleURL: jsCodeLocation, moduleName: "spotter", initialProperties: nil, launchOptions: nil)
    let rootViewController = NSViewController()
    rootViewController.view = rootView
    //Menu Bar Item
    let statusBar = NSStatusBar.system
        statusBarItem = statusBar.statusItem(
            withLength: NSStatusItem.squareLength)
        statusBarItem.button?.title = "Find"//Should change to spotter logo in future
        let statusBarMenu = NSMenu(title: "Cap Status Bar Menu")
        statusBarItem.menu = statusBarMenu
        statusBarMenu.addItem(
            withTitle: "Open Spotter",
            action: #selector(AppDelegate.openspotter),
            keyEquivalent: "")
        statusBarMenu.addItem(
            withTitle: "Preferences",
            action: #selector(AppDelegate.openpreferences),
            keyEquivalent: "")
        statusBarMenu.addItem(
            withTitle: "Quit",
            action: #selector(AppDelegate.Quitapp),
            keyEquivalent: "q")
    //End Menu Bar Item
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

