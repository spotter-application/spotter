//
//  PanelController.swift
//  spotter-macOS
//
//  Created by Denis Zyulev on 24/07/2020.
//

enum KeyCode {
  static let esc: UInt16 = 53
  static let enter: UInt16 = 36
  static let upArrow: UInt16 = 126
  static let downArrow: UInt16 = 125
}

public struct Option {
  var title: String
  var subtitle: String
  var image: NSImage
}

import Foundation

class PanelController: NSViewController, NSTextFieldDelegate, NSOutlineViewDelegate {
  
  let IGNORED_KEYCODES = [
    KeyCode.esc, KeyCode.enter,
    KeyCode.upArrow, KeyCode.downArrow
  ]
  
  private var panel: NSPanel!
  private var isActivePanel = false
  
  private var stackView: NSStackView!
  private var searchField: NSTextField!
  private var transparentView: NSVisualEffectView!
  private var matchesList: NSOutlineView!
  private var scrollView: NSScrollView!
  private var settings: PanelSettings!
  
  public var options: [Option]!
  private var matches: [Option]!
  private var selected: Int?

  
  init(settings: PanelSettings) {
    super.init(nibName: nil, bundle: nil)
    
    self.settings = settings
    self.matches = []
    
    setupPanel()
    setupSearchField()
    setupTransparentView()
    setupMatchesListView()
    setupScrollView()
    setupStackView()
    
    stackView.addArrangedSubview(searchField)
    stackView.addArrangedSubview(scrollView)
    transparentView.addSubview(stackView)
    panel.contentView?.addSubview(transparentView)
    
    setupConstraints()
    
    NSEvent.addLocalMonitorForEvents(matching: .keyDown, handler: keyDown)
  }
  
  public func togglePanel() {
    if isActivePanel {
      panel.close()
      isActivePanel = false
      self.reset()
    } else {
      panel.makeKeyAndOrderFront(nil)
      panel.center()
      isActivePanel = true
      
      reloadMatches()
    }
  }
  
  private func reset() {
    searchField.stringValue = ""
    matches = []
  }
  
  /*
   ====================================================================
   Setup
   ====================================================================
  */
  
  private func setupPanel() {
    panel = NSPanel(contentRect: NSRect(x: 0, y: 0, width: 400, height: 40), styleMask: [
      .borderless,
      .nonactivatingPanel,
      .titled,
      .resizable,
    ], backing: .buffered, defer: true)
    
    panel.level = .mainMenu
    panel.backgroundColor = NSColor.clear
  }
  
  private func setupStackView() {
    stackView = NSStackView()
    stackView.spacing = 0.0
    stackView.orientation = .vertical
    stackView.distribution = .fillEqually
    stackView.edgeInsets = NSEdgeInsets(top: 10.0, left: 10.0, bottom: 10.0, right: 10.0)
    stackView.translatesAutoresizingMaskIntoConstraints = false
    stackView.distribution = .fill
  }
  
  private func setupSearchField() {
    searchField = NSTextField()
    searchField.delegate = self
//    searchField.alignment = .left
//    searchField.isEditable = true
    searchField.isBezeled = false
//    searchField.isEnabled = true
//    searchField.isSelectable = true
    searchField.font = NSFont.systemFont(ofSize: 20, weight: .light)
//    searchField.focusRingType = .none
    searchField.drawsBackground = false
    searchField.placeholderString = "Query here..."
    
    searchField.setFrameSize(NSMakeSize(400, 40))
    searchField.backgroundColor = NSColor.green
  }
  
  private func setupTransparentView() {
    let frame = NSRect(
      x: 0,
      y: 0,
      width: 600,
      height: 40
    )

    transparentView = NSVisualEffectView()
    transparentView.frame = frame
    transparentView.state = .active
    transparentView.wantsLayer = true
    transparentView.blendingMode = .behindWindow
    transparentView.layer?.cornerRadius = 8
    transparentView.material = .popover
  }
  
  private func setupMatchesListView() {
    matchesList = NSOutlineView()
    matchesList.delegate = self
    matchesList.headerView = nil
    matchesList.wantsLayer = true
    matchesList.dataSource = self
    matchesList.selectionHighlightStyle = .sourceList

    let column = NSTableColumn()
    matchesList.addTableColumn(column)
  }
  
  private func setupScrollView() {
    scrollView = NSScrollView()
    scrollView.borderType = .noBorder
    scrollView.drawsBackground = false
    scrollView.autohidesScrollers = true
    scrollView.hasVerticalScroller = true
    scrollView.documentView = matchesList
    scrollView.translatesAutoresizingMaskIntoConstraints = true
  }
  
  private func setupConstraints() {
    let stackViewConstraints = [
      stackView.topAnchor.constraint(equalTo: transparentView.topAnchor),
      stackView.bottomAnchor.constraint(equalTo: transparentView.bottomAnchor),
      stackView.leadingAnchor.constraint(equalTo: transparentView.leadingAnchor),
      stackView.trailingAnchor.constraint(equalTo: transparentView.trailingAnchor)
    ]

    NSLayoutConstraint.activate(stackViewConstraints)
  }
  
  /*
   ====================================================================
   Events
   ====================================================================
  */
  
  func keyDown(with event: NSEvent) -> NSEvent? {
    let keyCode = event.keyCode

    if keyCode == KeyCode.esc {
      togglePanel();
      return nil
    }

    if keyCode == KeyCode.enter {
      itemSelected()
      return nil
    }

    if keyCode == KeyCode.downArrow {
      if let currentSelection = selected {
        setSelected(at: currentSelection + 1)
      }

      return nil
    }

    if keyCode == KeyCode.upArrow {
      if let currentSelection = selected {
        setSelected(at: currentSelection - 1)
      }

      return nil
    }

    self.keyUp(with: event)
    return event
  }
  
  override func keyUp(with event: NSEvent) {
    if IGNORED_KEYCODES.contains(event.keyCode) {
      return
    }

    let value = searchField.stringValue + event.characters!
    
    matches = settings.delegate?.valueWasEntered(value)

    reloadMatches()
  }
  
  @objc func itemSelected() {
    let selected = matchesList.item(atRow: matchesList.selectedRow) as! Option

    if let delegate = settings.delegate {
      delegate.itemWasSelected(selected: selected)
    }

    self.togglePanel()
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  /*
   ====================================================================
   UI
   ====================================================================
  */
  
  internal func outlineView(_ outlineView: NSOutlineView, viewFor tableColumn: NSTableColumn?, item: Any) -> NSView? {
    return settings.delegate?.getItemView(option: item as! Option)
  }
  
  private func clearMatches() {
    matches = []
    reloadMatches()
  }

  private func reloadMatches() {
    matchesList.reloadData()
    updateViewSize()

    if matches.count > 0 {
      setSelected(at: 0)
    }
  }

  private func setSelected(at index: Int) {
    if index < 0 || index >= matches.count {
      return
    }

    selected = index
    let selectedIndex = IndexSet(integer: index)
    matchesList.scrollRowToVisible(index)
    matchesList.selectRowIndexes(selectedIndex, byExtendingSelection: false)
  }

  private func updateViewSize() {
    let numMatches = matches.count > settings.matchesShown
      ? settings.matchesShown : matches.count

    let rowHeight = CGFloat(numMatches) * settings.rowHeight
    let newHeight = settings.height + rowHeight

    let newSize = NSSize(width: settings.width, height: newHeight)

    guard var frame = panel.contentView?.window?.frame else { return }
    
//    print("newSize")
//    print(frame.size.height)

    frame.origin.y += frame.size.height;
    frame.origin.y -= newSize.height;
    frame.size = newSize

    panel.contentView?.setFrameSize(newSize)
    transparentView.setFrameSize(newSize)
    panel.contentView?.window?.setFrame(frame, display: true)
    
    
    stackView.spacing = matches.count > 0 ? 5.0 : 0.0
  }
}

extension PanelController: NSOutlineViewDataSource {

  func outlineView(_ outlineView: NSOutlineView, numberOfChildrenOfItem item: Any?) -> Int {
    return matches.count
  }

  func outlineView(_ outlineView: NSOutlineView, child index: Int, ofItem item: Any?) -> Any {
    return matches[index]
  }

  func outlineView(_ outlineView: NSOutlineView, isItemExpandable item: Any) -> Bool {
    return false
  }

  func outlineView(_ outlineView: NSOutlineView, heightOfRowByItem item: Any) -> CGFloat {
    return 50
  }

  func outlineView(_ outlineView: NSOutlineView, shouldSelectItem item: Any) -> Bool {
    return true
  }

  func outlineView(_ outlineView: NSOutlineView, rowViewForItem item: Any) -> NSTableRowView? {
    return PanelTableRowView(frame: NSZeroRect)
  }

  func outlineViewSelectionDidChange(_ notification: Notification) {
    selected = matchesList.selectedRow
  }
}

class PanelTableRowView: NSTableRowView {
  override var isEmphasized: Bool {
    get {
      return true
    }

    set {}
  }
}

public protocol PanelDelegate {

  func itemWasSelected(selected item: Option)

  func valueWasEntered(_ value: String) -> [Option]

  func getItemView(option: Option) -> NSView?
  
  func windowDidClose()

}
