//
//  PanelOptions.swift
//  spotter-macOS
//
//  Created by Denis Zyulev on 24/07/2020.
//

import Foundation

public class PanelSettings {

  public init() {
    self.radius = 7
    self.width = 400
    self.height = 44
    self.rowHeight = 50
    self.matchesShown = 6
    self.material = .popover
    self.placeholder = "Query here..."
    self.persistMatches = false
    self.persistPosition = true
    self.font = NSFont.systemFont(ofSize: 20, weight: .light)
    self.edgeInsets = NSEdgeInsets(top: 10.0, left: 10.0, bottom: 10.0, right: 10.0)
  }

  public var font: NSFont

  public var radius: CGFloat

  public var width: CGFloat

  public var height: CGFloat
  
  public var matchesShown: Int

  public var rowHeight: CGFloat

  public var placeholder: String

  public var persistMatches: Bool

  public var persistPosition: Bool

  public var edgeInsets: NSEdgeInsets

  public var material: NSVisualEffectView.Material

  public var delegate: PanelDelegate?

}
