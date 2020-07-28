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
  var id: String
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

  private var options: [Option]!
  private var selected: Int?

  
  init(settings: PanelSettings) {
    super.init(nibName: nil, bundle: nil)
    
    self.settings = settings
    self.options = []
    
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
    panel.makeFirstResponder(searchField)
    
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
      
      reloadOptions()
    }
  }
  
  public func displayOptions(options: [Option]) {
    self.options = options
    self.reloadOptions()
  }
  
  private func reset() {
    searchField.stringValue = ""
    options = []
  }
  
  /*
   ====================================================================
   Setup
   ====================================================================
  */
  
  private func setupPanel() {
    panel = NSPanel(contentRect: NSRect(x: 0, y: 10, width: settings.width, height: settings.height), styleMask: [
        .nonactivatingPanel,
        .titled,
        .fullSizeContentView,
        ], backing: .buffered, defer: true)
    panel.titleVisibility = .hidden
    panel.level = .mainMenu
    panel.titlebarAppearsTransparent = true
  }
  
  private func setupStackView() {
    stackView = NSStackView()
    stackView.spacing = 0.0
    stackView.orientation = .vertical
    stackView.distribution = .fillEqually
    stackView.edgeInsets = settings.edgeInsets
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
    searchField.font = settings.font
    searchField.focusRingType = .none
    searchField.drawsBackground = false
    searchField.placeholderString = settings.placeholder
    
    searchField.setFrameSize(NSMakeSize(settings.width, settings.height))
  }
  
  private func setupTransparentView() {
    let frame = NSRect(
      x: 0,
      y: 0,
      width: settings.width,
      height: settings.height
    )

    transparentView = NSVisualEffectView()
    transparentView.frame = frame
    transparentView.state = .active
    transparentView.wantsLayer = true
    transparentView.blendingMode = .behindWindow
    transparentView.layer?.cornerRadius = settings.radius
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

    let value = (event.keyCode == 51) ?
      String(searchField.stringValue.dropLast()) : (searchField.stringValue + event.characters!)
    
    settings.delegate?.valueWasEntered(value)

    reloadOptions()
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

  private func reloadOptions() {
    matchesList.reloadData()
    updateViewSize()

    if options.count > 0 {
      setSelected(at: 0)
    }
  }

  private func setSelected(at index: Int) {
    if index < 0 || index >= options.count {
      return
    }

    selected = index
    let selectedIndex = IndexSet(integer: index)
    matchesList.scrollRowToVisible(index)
    matchesList.selectRowIndexes(selectedIndex, byExtendingSelection: false)
  }

  private func updateViewSize() {
    let numMatches = options.count > settings.matchesShown
      ? settings.matchesShown : options.count

    let rowHeight = CGFloat(numMatches) * settings.rowHeight
    let newHeight = settings.height + rowHeight

    let newSize = NSSize(width: settings.width, height: newHeight)

    guard var frame = panel.contentView?.window?.frame else { return }

    frame.origin.y += frame.size.height;
    frame.origin.y -= newSize.height;
    frame.size = newSize

    panel.contentView?.setFrameSize(newSize)
    transparentView.setFrameSize(newSize)
    panel.contentView?.window?.setFrame(frame, display: true)
    
    
    stackView.spacing = options.count > 0 ? 5.0 : 0.0
  }
}

extension PanelController: NSOutlineViewDataSource {

  func outlineView(_ outlineView: NSOutlineView, numberOfChildrenOfItem item: Any?) -> Int {
    return options.count
  }

  func outlineView(_ outlineView: NSOutlineView, child index: Int, ofItem item: Any?) -> Any {
    return options[index]
  }

  func outlineView(_ outlineView: NSOutlineView, isItemExpandable item: Any) -> Bool {
    return false
  }

  func outlineView(_ outlineView: NSOutlineView, heightOfRowByItem item: Any) -> CGFloat {
    return settings.rowHeight
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

  func valueWasEntered(_ value: String)

  func getItemView(option: Option) -> NSView?
  
  func windowDidClose()

}
