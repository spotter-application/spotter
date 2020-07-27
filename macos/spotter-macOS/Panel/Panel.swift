
//  Panel.swift
//  spotter-macOS
//
//  Created by Denis Zyulev on 11/07/2020.
//

import Foundation
import HotKey
import ShellOut

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
        return
      }

      hotKey.keyDownHandler = { [weak self] in
        self?.panelController.togglePanel()

      }
    }
  }

  @objc
  func registerHotkey() {
//    let applications = self.getAllApplications
    
//    print(applications)

    hotKey = HotKey(keyCombo: KeyCombo(key: .s, modifiers: [.option]))
  }
  
  // TODO: Move to class
  private func getAllApplications() -> [Any] {
      let fileManager = FileManager()

      guard let applicationsFolderUrl = try? FileManager.default.url(for: .applicationDirectory, in: .localDomainMask, appropriateFor: nil, create: false) else { return [] }

      let applicationUrls = try! fileManager.contentsOfDirectory(at: applicationsFolderUrl , includingPropertiesForKeys: [], options: [FileManager.DirectoryEnumerationOptions.skipsPackageDescendants, FileManager.DirectoryEnumerationOptions.skipsSubdirectoryDescendants])

      guard let systemApplicationsFolderUrl = try? FileManager.default.url(for: .applicationDirectory, in: .systemDomainMask, appropriateFor: nil, create: false) else { return [] }

    let utilitiesFolderUrl = NSURL.init(string: "\(systemApplicationsFolderUrl.path)/Utilities")! as URL

      guard let utilitiesUrls = try? fileManager.contentsOfDirectory(at: utilitiesFolderUrl, includingPropertiesForKeys: [], options: [FileManager.DirectoryEnumerationOptions.skipsPackageDescendants, FileManager.DirectoryEnumerationOptions.skipsSubdirectoryDescendants]) else { return [] }

      let urls = applicationUrls + utilitiesUrls

      var applications = [Any]()

      for url in urls {
          print(url.path, fileManager.isExecutableFile(atPath: url.path))
          if fileManager.isExecutableFile(atPath: url.path) {
              guard let mdi = NSMetadataItem(url: url) else { continue }
            
            let option = [
              "title": mdi.value(forAttribute: kMDItemDisplayName as String) as! String,
              "path": mdi.value(forAttribute: kMDItemPath as String) as! String
            ]
      
            applications.append(option)
          }
      }

      return applications
  }
  
  @objc
  func displayOptions(_ options: NSArray) {
    var nextOptions: [Option] = []
    
    for option in options {
      nextOptions.append(Option(
        id: (option as AnyObject)["id"] as! String,
        title: (option as AnyObject)["title"] as! String,
        subtitle: (option as AnyObject)["subtitle"] as! String,
        image: NSWorkspace.shared.icon(forFileType: ".swift")
      ))
    }
    
    DispatchQueue.main.async {
      self.panelController.displayOptions(options: nextOptions)
    }
  }

  override func supportedEvents() -> [String]! {
    return ["query", "onSelected"]
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

  func valueWasEntered(_ value: String) {
    self.sendEvent(withName: "query", body: value)
  }

  func itemWasSelected(selected option: Option) {
    self.sendEvent(withName: "onSelected", body: ["value": option.id])
  }

  func windowDidClose() {
    print("Window did close")
  }

}
