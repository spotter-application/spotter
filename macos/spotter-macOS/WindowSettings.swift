//
//  WindowOptions.swift
//  spotter-macOS
//
//  Created by Denis Zyulev on 24/07/2020.
//

import Foundation

public class WindowSettings {

  /// Setup sensible defaults
  public init() {
    self.radius = 7
    self.width = 400
    self.height = 44
    self.rowHeight = 20
    self.matchesShown = 6
    self.material = .popover
    self.placeholder = "Search"
    self.persistMatches = false
    self.persistPosition = true
    self.font = NSFont.systemFont(ofSize: 20, weight: .light)
    self.edgeInsets = NSEdgeInsets(top: 10.0, left: 10.0, bottom: 10.0, right: 10.0)
  }

  // MARK: - UI options
  /// The font to be used for the search field
  public var font: NSFont

  /// The radius of the open quickly window
  public var radius: CGFloat

  /// The width of the open quickly window
  public var width: CGFloat

  /// The height of the open quickly window
  public var height: CGFloat

  /// The maximum number of matches shown
  public var matchesShown: Int

  /// The height of each row in the matches list
  public var rowHeight: CGFloat

  /// The placeholder text to be used for the search field
  public var placeholder: String

  /// Whether to persist the matches list when the
  /// open quickly window is closed and re-opened
  public var persistMatches: Bool

  /// Whether to persist the position of the open quickly
  /// window when it is closed and re-opened
  public var persistPosition: Bool

  /// The insets for the search field and matches list
  public var edgeInsets: NSEdgeInsets

  /// The material effect to be used for the open quickly window
  public var material: NSVisualEffectView.Material

  // MARK: - Delegate options
  /// An instance that conforms to the OpenQuicklyDelegate
  public var delegate: WindowDelegate?

}
