import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart' hide MenuItem;
import 'package:hotkey_manager/hotkey_manager.dart';
import 'package:system_tray/system_tray.dart';
import 'package:window_manager/window_manager.dart'; // TODO: remove
import 'package:bitsdojo_window/bitsdojo_window.dart';
import 'package:flutter/services.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await windowManager.ensureInitialized();

  await hotKeyManager.unregisterAll();

  doWhenWindowReady(() {
    const initialSize = Size(800, 350);
    appWindow.minSize = initialSize;
    appWindow.maxSize = initialSize;
    appWindow.size = initialSize;
    appWindow.alignment = Alignment.center;
    appWindow.show();
  });
  // await hotKeyManager.unregisterAll();


  HotKey openHotKey = HotKey(
    KeyCode.keyS,
    modifiers: [KeyModifier.control, KeyModifier.shift],
    // Set hotkey scope (default is HotKeyScope.system)
    // scope: HotKeyScope.inapp, // Set as inapp-wide hotkey.
  );
  await hotKeyManager.register(
    openHotKey,
    keyDownHandler: (hotKey) {
      print('onKeyDown+${hotKey.toJson()}');
    },
    // Only works on macOS.
    keyUpHandler: (hotKey){
      print('onKeyUp+${hotKey.toJson()}');
    } ,
  );

  HotKey closeHotKey = HotKey(
    KeyCode.escape,
    modifiers: [KeyModifier.control],
    scope: HotKeyScope.inapp,
  );
  // final AppWindow appWindow = AppWindow();
  await hotKeyManager.register(
    closeHotKey,
    keyDownHandler: (hotKey) async {
      print("CLOSE");
      print('onKeyDown+${hotKey.toJson()}');
      await windowManager.hide();
      // await windowManager.show();
    },
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        scaffoldBackgroundColor: Colors.transparent,
      ),
      home: const MyHomePage(
        title: 'Flutter Demo Home Page',
      ),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class Option {
  final String id;
  final String name;

  Option({
    required this.id,
    required this.name,
  });
}

String getTrayImagePath(String imageName) {
  return Platform.isWindows ? 'assets/$imageName.ico' : 'assets/$imageName.png';
}

String getImagePath(String imageName) {
  return Platform.isWindows ? 'assets/$imageName.bmp' : 'assets/$imageName.png';
}

class _MyHomePageState extends State<MyHomePage> {
  final AppWindow _appWindow = AppWindow();
  final SystemTray _systemTray = SystemTray();
  final Menu _menuMain = Menu();

  final searchTextController = TextEditingController();
  final scrollController = ScrollController();

  int selectedOptionIndex = 0;

  List<Option> options = [
    Option(id: '1', name: 'Alacritty'),
    Option(id: '2', name: 'Brave browser'),
    Option(id: '3', name: 'Slack'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
    Option(id: '4', name: 'Signal'),
  ];

  List<Option> filteredOptions = [];

  @override
  void initState() {
    super.initState();

    initSystemTray();
    searchTextController.addListener(onQuery);

    initServer();
  }

  Future<void> initServer() async {
    var server = await HttpServer.bind(InternetAddress.anyIPv6, 3212);
    await server.forEach((HttpRequest request) async {
    
      _appWindow.show();
      // await windowManager.show();
      // await windowManager.focus();

      request.response.write('Hello, world!');
      request.response.close();
    });
  }

  Future<void> initSystemTray() async {

    await _systemTray.initSystemTray(iconPath: getTrayImagePath('app_icon'));
    _systemTray.setTitle("system tray");
    _systemTray.setToolTip("How to use system tray with Flutter");

    _systemTray.registerSystemTrayEventHandler((eventName) {
      debugPrint("eventName: $eventName");
      if (eventName == kSystemTrayEventClick) {
        Platform.isWindows ? _appWindow.show() : _systemTray.popUpContextMenu();
      } else if (eventName == kSystemTrayEventRightClick) {
        Platform.isWindows ? _systemTray.popUpContextMenu() : _appWindow.show();
      }
    });

    await _menuMain.buildFrom(
      [
        MenuItemLabel(
            label: 'Show',
            image: getImagePath('darts_icon'),
            onClicked: (menuItem) async => {
              await windowManager.show(),
              await windowManager.focus()
            },
        ),
        MenuItemLabel(
            label: 'Hide',
            image: getImagePath('darts_icon'),
            onClicked: (menuItem) => _appWindow.hide()),
        MenuSeparator(),
        MenuItemLabel(
            label: 'Exit', onClicked: (menuItem) => _appWindow.close()
        ),
      ]
    );

    _systemTray.setContextMenu(_menuMain);
  }

  @override
  void dispose() {
    searchTextController.dispose();
    super.dispose();
  }

  void onQuery() {
    setState(() {
      selectedOptionIndex = 0;
      filteredOptions = options.where((option) => option.name.toLowerCase().contains(searchTextController.text.toLowerCase())).toList();
    });
  }

  void selectNextOption() {
    setState(() {
      selectedOptionIndex = selectedOptionIndex >= filteredOptions.length - 1
        ? 0
        : selectedOptionIndex + 1;
    });
    // scrollController.animateTo(
    //   (30 * selectedOptionIndex).toDouble(),
    //   duration: const Duration(milliseconds: 500),
    //   curve: Curves.ease,
    // );
  }

  void selectPreviousOption() {
    setState(() {
      selectedOptionIndex = selectedOptionIndex <= 0
        ? filteredOptions.length - 1
        : selectedOptionIndex - 1;
    });
  }

  void scrollToMakeOptionsVisible() {
    double nextOffset = (30 * (selectedOptionIndex - 5)).toDouble();

    scrollController.animateTo(
      nextOffset,
      duration: const Duration(milliseconds: 100),
      curve: Curves.linear,
    );
  }

  @override
  Widget build(BuildContext context) {
    var focusNode = FocusNode();
    KeyEventResult handleKeyEvent(RawKeyEvent event) {
      if (event is RawKeyUpEvent) {
        return KeyEventResult.ignored;
      }

      if (event.logicalKey == LogicalKeyboardKey.escape) {
        windowManager.hide();
        searchTextController.clear();
        setState(() {
          filteredOptions = [];
        });
        return KeyEventResult.handled;
      }

      bool next = (event.isControlPressed && event.logicalKey == LogicalKeyboardKey.keyN)
        || event.logicalKey == LogicalKeyboardKey.arrowDown;
      
      if (next) {
        selectNextOption();
        scrollToMakeOptionsVisible();
        return KeyEventResult.ignored;
      }


      bool previous = (event.isControlPressed && event.logicalKey == LogicalKeyboardKey.keyP)
        || event.logicalKey == LogicalKeyboardKey.arrowUp;

      if (previous) {
        selectPreviousOption();
        scrollToMakeOptionsVisible();
        return KeyEventResult.ignored;
      }

      return KeyEventResult.ignored;
    }
    return Scaffold(
      // resizeToAvoidBottomInset: false,
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(10),
                topRight: const Radius.circular(10),
                bottomLeft: Radius.circular(filteredOptions.isEmpty ? 10 : 0),
                bottomRight: Radius.circular(filteredOptions.isEmpty ? 10 : 0),
              ),
            ),
            clipBehavior: Clip.hardEdge,
            child: RawKeyboardListener(
              focusNode: focusNode,
              onKey: handleKeyEvent,
              child: TextField(
                controller: searchTextController,
                autofocus: true,
                decoration: const InputDecoration(
                  filled: true,
                  fillColor: Colors.grey,
                  border: InputBorder.none,
                  hintText: 'Query...',
                )
              )
            ),
          ),
          Container(
            height: 30 * 10,
            decoration: const BoxDecoration(
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(10),
                bottomRight: Radius.circular(10),
              ),
            ),
            clipBehavior: Clip.hardEdge,
            child: SingleChildScrollView(
              controller: scrollController,
              child: Column(children: [
                for(var i = 0; i < filteredOptions.length; i++) Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.only(
                      bottomLeft: Radius.circular(i == filteredOptions.length - 1 ? 10 : 0),
                      bottomRight: Radius.circular(i == filteredOptions.length - 1 ? 10 : 0),
                    ),
                    color: selectedOptionIndex == i ? Colors.blue : Colors.grey,
                  ),
                  clipBehavior: Clip.hardEdge,
                  height: 30,
                  width: double.infinity,
                  child: Text(filteredOptions[i].name),
                )
              ])
            )
          )
        ],
      ),
    );
  }
}
