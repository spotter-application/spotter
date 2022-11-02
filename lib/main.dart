import 'dart:async';
import 'dart:io';

import 'package:bitsdojo_window/bitsdojo_window.dart';
import 'package:flutter/material.dart' hide MenuItem;
import 'package:hotkey_manager/hotkey_manager.dart';
import 'package:system_tray/system_tray.dart';
import 'package:flutter/services.dart';
import 'package:window_manager/window_manager.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // await hotKeyManager.unregisterAll();

  // Must add this line.
  doWhenWindowReady(() {
    const initialSize = Size(600, 200);
    appWindow.minSize = initialSize;
    appWindow.maxSize = initialSize;
    appWindow.size = initialSize;
    appWindow.alignment = Alignment.center;
    appWindow.show();
  });


  HotKey _hotKey = HotKey(
    KeyCode.space,
    modifiers: [KeyModifier.alt],
    // Set hotkey scope (default is HotKeyScope.system)
    // scope: HotKeyScope.inapp, // Set as inapp-wide hotkey.
  );
  await hotKeyManager.register(
    _hotKey,
    keyDownHandler: (hotKey) {
      print('onKeyDown+${hotKey.toJson()}');
    },
    // Only works on macOS.
    keyUpHandler: (hotKey){
      print('onKeyUp+${hotKey.toJson()}');
    } ,
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

  final searchTextController = new TextEditingController();

  List<Option> options = [
    Option(id: '1', name: 'Alacritty'),
    Option(id: '2', name: 'Brave browser'),
  ];

  List<Option> filteredOptions = [];

  @override
  void initState() {
    super.initState();

    initSystemTray();
    searchTextController.addListener(_printLatestValue);
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
              _appWindow.show(),
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

  void _printLatestValue() {
    print('Second text field: ${searchTextController.text}');
    setState(() {
      filteredOptions = options.where((option) => option.name.toLowerCase().contains(searchTextController.text)).toList();
    });
  }

  // @override
  // void onWindowBlur() async {
  //   print("heeey");
  //   // await windowManager.hide();
  // }

  @override
  Widget build(BuildContext context) {
    var focusNode = FocusNode();
    return Scaffold(
      // appBar: AppBar(
      //   title: Text(widget.title),
      // ),
      body: Center(
        child: RawKeyboardListener(
          focusNode: focusNode,
          onKey: (event) {
            if (event.isKeyPressed(LogicalKeyboardKey.escape)) {
              _appWindow.hide();
            }
          },
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              TextField(
                controller: searchTextController,
                autofocus: true,
                decoration: const InputDecoration(
                  border: InputBorder.none,
                  labelText: 'Query...',
                )
              ),
              Row(children: [
                for(var option in filteredOptions) Text(option.name)
              ]),
            ],
          ),
        ),
      ),
    );
  }
}
