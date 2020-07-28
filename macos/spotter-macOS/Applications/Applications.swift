//
//  Applications.swift
//  spotter-macOS
//
//  Created by Denis Zyulev on 28/07/2020.
//

import Foundation
import ShellOut

@objc(Applications)
class Applications: RCTEventEmitter {

  @objc
  func getAll(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Any {
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

    return resolve(applications)
  }
  
  @objc
  func open(_ path: String) {
    NSWorkspace.shared.open(URL(fileURLWithPath: path))
  }

  override func supportedEvents() -> [String]! {
    return []
  }

}
