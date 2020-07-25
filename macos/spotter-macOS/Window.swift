//
//  Window.swift
//  spotter-macOS
//
//  Created by Denis Zyulev on 24/07/2020.
//

import Foundation

struct Language {
  var name: String
  var subtitle: String
  var image: NSImage
}

enum KeyCode {
  static let esc: UInt16 = 53
  static let enter: UInt16 = 36
  static let upArrow: UInt16 = 126
  static let downArrow: UInt16 = 125
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

class Window: NSViewController, NSTextFieldDelegate, NSOutlineViewDelegate {
  
  let IGNORED_KEYCODES = [
    KeyCode.esc, KeyCode.enter,
    KeyCode.upArrow, KeyCode.downArrow
  ]
  
  private var panel = NSPanel(contentRect: NSRect(x: 0, y: 0, width: 400, height: 40), styleMask: [
    .borderless,
    .nonactivatingPanel,
    .titled,
    .resizable,
  ], backing: .buffered, defer: true)
  
  private var isActivePanel = false
  
  /// An instance that conforms to the OpenQuicklyDelegate
  public var delegate: OpenQuicklyDelegate?
  
  private var matches: [Any]!
  
  /// Configuration options
   private var options: WindowOptions!
  
  
  func keyDown(with event: NSEvent) -> NSEvent? {
    let keyCode = event.keyCode

    // When esc pressed, close the window
    if keyCode == KeyCode.esc {
//      openQuicklyWindowController?.toggle()
      print("CLOSE!")
      return nil
    }

    // When enter pressed, indicate that an item was selected
    if keyCode == KeyCode.enter {
      itemSelected()
      return nil
    }

    // When down arrow pressed, if there is a selection move it down
    if keyCode == KeyCode.downArrow {
      if let currentSelection = selected {
        setSelected(at: currentSelection + 1)
      }

      return nil
    }

    // When uo arrow pressed, if there is a selection move it up
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
    
    print(value)
    
    let nextMatches = languages.filter {
      $0.name.lowercased().contains(value.lowercased())
    }

    matches = nextMatches

    reloadMatches()
  }
  
  @objc func itemSelected() {
    print("SELECTED")
//    let selected = matchesList.item(atRow: matchesList.selectedRow) as Any
//
//    if let delegate = options.delegate {
//      delegate.itemWasSelected(selected: selected)
//    }
//
//    openQuicklyWindowController?.toggle()
  }
  
  
  init() {
    super.init(nibName: nil, bundle: nil)
    
    NSEvent.addLocalMonitorForEvents(matching: .keyDown, handler: keyDown)
    
    self.options = WindowOptions()
    self.matches = []
    
//    self.matches = []
    
    panel.level = .mainMenu
    panel.backgroundColor = NSColor.clear
    
    // Setup
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
    
    
    
//    NSEvent.addLocalMonitorForEvents(matching: .keyDown) { (event) -> NSEvent? in
//      if self.keyDown(with: event) {
//        return nil
//      }
//
//      return event
//    }
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  func valueWasEntered(_ value: String) -> [Any] {
//    let matches = languages.filter {
//      $0.name.lowercased().contains(value.lowercased())
//    }

    print("TEST")
    return []
  }

  func itemWasSelected(selected item: Any) {
    guard let language = item as? Language else { return }

    print("\(language.name) was selected")
  }

  func windowDidClose() {
    print("Window did close")
  }
  
  
  
  func openQuickly(item: Any) -> NSView? {
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
  
  public func outlineView(_ outlineView: NSOutlineView, viewFor tableColumn: NSTableColumn?, item: Any) -> NSView? {
    return openQuickly(item: item)
  }
  
  
  private var stackView: NSStackView!
  private func setupStackView() {
    stackView = NSStackView()
    stackView.spacing = 0.0
    stackView.orientation = .vertical
    stackView.distribution = .fillEqually
    stackView.edgeInsets = NSEdgeInsets(top: 10.0, left: 10.0, bottom: 10.0, right: 10.0)
    stackView.translatesAutoresizingMaskIntoConstraints = false
    
    stackView.distribution = .fill

  }
  
  private var searchField: NSTextField!
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
  
  
  private var transparentView: NSVisualEffectView!
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
  
  private var matchesList: NSOutlineView!
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
  
  private var scrollView: NSScrollView!
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
  
  // MARK: - UI management
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
    let numMatches = matches.count > options.matchesShown
      ? options.matchesShown : matches.count

    let rowHeight = CGFloat(numMatches) * options.rowHeight
    let newHeight = options.height + rowHeight

    let newSize = NSSize(width: options.width, height: newHeight)

    guard var frame = panel.contentView?.window?.frame else { return }
    
    print("newSize")
    print(frame.size.height)

    frame.origin.y += frame.size.height;
    frame.origin.y -= newSize.height;
    frame.size = newSize

    panel.contentView?.setFrameSize(newSize)
    transparentView.setFrameSize(newSize)
    panel.contentView?.window?.setFrame(frame, display: true)
    
    
    stackView.spacing = matches.count > 0 ? 5.0 : 0.0
    

  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  public func togglePanel() {
    if isActivePanel {
      panel.close()
      isActivePanel = false
    } else {
      panel.makeKeyAndOrderFront(nil)
      panel.center()
      isActivePanel = true
      
      reloadMatches()
    }
  }

  
}









/// The currently selected match
private var selected: Int?

extension Window: NSOutlineViewDataSource {

  /// Number of items in the matches list
  func outlineView(_ outlineView: NSOutlineView, numberOfChildrenOfItem item: Any?) -> Int {
    return matches.count
  }

  /// Items to be added to the matches list
  func outlineView(_ outlineView: NSOutlineView, child index: Int, ofItem item: Any?) -> Any {
    return matches[index]
  }

  /// Whether items in the matches list are expandable by an arrow
  func outlineView(_ outlineView: NSOutlineView, isItemExpandable item: Any) -> Bool {
    return false
  }

  /// Height of each item in the matches list
  func outlineView(_ outlineView: NSOutlineView, heightOfRowByItem item: Any) -> CGFloat {
    return 50
  }

  /// When an item in the matches list is clicked on should it be selected
  func outlineView(_ outlineView: NSOutlineView, shouldSelectItem item: Any) -> Bool {
    return true
  }

  /// The NSTableRowView instance to be used
  func outlineView(_ outlineView: NSOutlineView, rowViewForItem item: Any) -> NSTableRowView? {
    return OpenQuicklyTableRowView(frame: NSZeroRect)
  }

  /// When an item is selected
  func outlineViewSelectionDidChange(_ notification: Notification) {
    selected = matchesList.selectedRow
  }

}

//extension Window: NSOutlineViewDelegate {
//
//  /// The view for each item in the matches array
//  public func outlineView(_ outlineView: NSOutlineView, viewFor tableColumn: NSTableColumn?, item: Any) -> NSView? {
//    return options.delegate?.openQuickly(item: item)
//  }
//
//}

class OpenQuicklyTableRowView: NSTableRowView {

  override var isEmphasized: Bool {
    get {
      return true
    }

    set {}
  }

}

public protocol OpenQuicklyDelegate {

  /// Called when an item in the matches list was selected
  ///
  /// - Parameters:
  ///   - item: The selected item
  func itemWasSelected(selected item: Any)

  /// Called when a value was typed in the search bar
  ///
  /// - Parameters:
  ///   - value: The value entered in to the search field
  ///
  /// - Returns: Any matches based off the value typed
  func valueWasEntered(_ value: String) -> [Any]

  /// Given an item return a view to be used for that item in the matches list
  ///
  /// - Parameters:
  ///   - item: An item from the matches list
  ///
  /// - Returns: A view to display the given item in the matches list
  func openQuickly(item: Any) -> NSView?

  /// Called when the open quickly window is closed
  func windowDidClose()

}

