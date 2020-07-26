
//  Hotkeys.swift
//  spotter-macOS
//
//  Created by Denis Zyulev on 11/07/2020.
//

import Foundation
import HotKey

struct Language {
  var name: String
  var subtitle: String
  var image: NSImage
}

let languages: [Language] = [
  Language(
    name: "Swift",
    subtitle: "A general-purpose, multi-paradigm, compiled programming language",
    image: NSWorkspace.shared.icon(forFileType: ".swift")
  ),
  Language(
    name: "JavaScript",
    subtitle: "A high-level, interpreted programming language",
    image: NSWorkspace.shared.icon(forFileType: ".js")
  ),
  Language(
    name: "Java",
    subtitle: "A general-purpose computer-programming language",
    image: NSWorkspace.shared.icon(forFileType: ".java")
  ),
  Language(
    name: "Python",
    subtitle: "An interpreted, high-level, general-purpose programming language",
    image: NSWorkspace.shared.icon(forFileType: ".py")
  ),
  Language(
    name: "Ruby",
    subtitle: "A dynamic, interpreted, reflective, object-oriented, general-purpose programming language",
    image: NSWorkspace.shared.icon(forFileType: ".rb")
  ),
  Language(
    name: "Go",
    subtitle: "A statically typed, compiled programming language",
    image: NSWorkspace.shared.icon(forFileType: ".go")
  ),
  Language(
    name: "Markdown",
    subtitle: "A lightweight markup language",
    image: NSWorkspace.shared.icon(forFileType: ".md")
  ),
  Language(
    name: "Bash",
    subtitle: "A Unix shell and command language",
    image: NSWorkspace.shared.icon(forFileType: ".sh")
  )
]

@objc(Hotkeys)
class Hotkeys: RCTEventEmitter {
  
  private var window: Window!
  
  override init() {
    super.init()
    
    let windowSettings = WindowSettings()
    windowSettings.delegate = self
    self.window = Window(settings: windowSettings)
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

//        self?.togglePanel()
        print("OPEN PANEL")
        self?.window.togglePanel()

      }
    }
  }

  @objc
  func emit() {
    // Register hotkey
    hotKey = HotKey(keyCombo: KeyCombo(key: .s, modifiers: [.option]))

    sendEvent(withName: "onEvent", body: ["value": 123])
  }

  override func supportedEvents() -> [String]! {
    return ["onEvent"]
  }

}


extension Hotkeys: WindowDelegate {

  func getItemView(item: Any) -> NSView? {
    guard let language = item as? Language else { return nil }

    let view = NSStackView()

    let imageView = NSImageView(image: language.image)

    let title = NSTextField()

    title.isEditable = false
    title.isBezeled = false
    title.isSelectable = false
    title.focusRingType = .none
    title.drawsBackground = false
    title.font = NSFont.systemFont(ofSize: 14)
    title.stringValue = language.name

    let subtitle = NSTextField()

    subtitle.isEditable = false
    subtitle.isBezeled = false
    subtitle.isSelectable = false
    subtitle.focusRingType = .none
    subtitle.drawsBackground = false
    subtitle.stringValue = language.subtitle
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

  func valueWasEntered(_ value: String) -> [Any] {
    let matches = languages.filter {
      $0.name.lowercased().contains(value.lowercased())
    }

    print("RESULT________________")
    return matches
  }

  func itemWasSelected(selected item: Any) {
    guard let language = item as? Language else { return }

    print("\(language.name) was selected")
  }

  func windowDidClose() {
    print("Window did close")
  }

}
