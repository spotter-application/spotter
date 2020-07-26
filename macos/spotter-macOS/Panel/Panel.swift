
//  Panel.swift
//  spotter-macOS
//
//  Created by Denis Zyulev on 11/07/2020.
//

import Foundation
import HotKey

@objc(Panel)
class Panel: RCTEventEmitter {
  
  private var panelController: PanelController!
  
  override init() {
    super.init()
    
    let panelSettings = PanelSettings()
    panelSettings.delegate = self
    self.panelController = PanelController(settings: panelSettings)
  }

  private var hotKey: HotKey? {
    didSet {
      guard let hotKey = hotKey else {
        sendEvent(withName: "onEvent", body: ["value": "Unregistered"])
        return
      }

      sendEvent(withName: "onEvent", body: ["value": "Registered"])

      hotKey.keyDownHandler = { [weak self] in

        self?.sendEvent(withName: "onEvent", body: ["value": "Pressed at \(Date())"])

        print("OPEN PANEL")
        self?.panelController.togglePanel()

      }
    }
  }

  @objc
  func registerHotkey() {
    hotKey = HotKey(keyCombo: KeyCombo(key: .s, modifiers: [.option]))
  }
  
  @objc
  func registerOptions(_ options: NSArray) {
    var nextOptions: [Option] = []
    
    for option in options {
      nextOptions.append(Option(
        title: (option as AnyObject)["title"] as! String,
        subtitle: (option as AnyObject)["subtitle"] as! String,
        image: NSWorkspace.shared.icon(forFileType: ".swift")
      ))
    }
    
    panelController.options = nextOptions
  }

  override func supportedEvents() -> [String]! {
    return ["onEvent", "onSelected"]
  }

}


extension Panel: PanelDelegate {

  func getItemView(option: Option) -> NSView? {
    let view = NSStackView()

    let imageView = NSImageView(image: option.image)

    let title = NSTextField()

    title.isEditable = false
    title.isBezeled = false
    title.isSelectable = false
    title.focusRingType = .none
    title.drawsBackground = false
    title.font = NSFont.systemFont(ofSize: 14)
    title.stringValue = option.title

    let subtitle = NSTextField()

    subtitle.isEditable = false
    subtitle.isBezeled = false
    subtitle.isSelectable = false
    subtitle.focusRingType = .none
    subtitle.drawsBackground = false
    subtitle.stringValue = option.subtitle
    subtitle.font = NSFont.systemFont(ofSize: 12)

    let text = NSStackView()
    text.orientation = .vertical
    text.spacing = 2.0
    text.alignment = .left

    text.addArrangedSubview(title)
    text.addArrangedSubview(subtitle)

    view.addArrangedSubview(imageView)
    view.addArrangedSubview(text)

    return view
  }

  func valueWasEntered(_ value: String) -> [Option] {
    
    let matches = panelController.options.filter {
      $0.title.lowercased().contains(value.lowercased())
    }
    
    return matches
  }

  func itemWasSelected(selected option: Option) {
    print("\(option.title) was selected")
    self.sendEvent(withName: "onSelected", body: ["value": "\(option.title) was selected!!!"])
  }

  func windowDidClose() {
    print("Window did close")
  }

}
