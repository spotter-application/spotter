import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:bitsdojo_window/bitsdojo_window.dart';
import 'package:flutter/material.dart' hide MenuItem;
import 'package:flutter/services.dart';
import 'package:hotkey_manager/hotkey_manager.dart';
import 'package:system_tray/system_tray.dart';
import 'package:window_manager/window_manager.dart'; // TODO: remove
import 'package:process_run/shell.dart';

typedef OnNextOptions = void Function(List<Option> options);

class PluginsServer {

  OnNextOptions onNextOptions;

  PluginsServer(this.onNextOptions);

  List<WebSocket> plugins = [];

  start() async {
    HttpServer server = await HttpServer.bind('0.0.0.0', 4040);
    server.transform(WebSocketTransformer()).listen(handleConnection);
  }

  onQuery(String query) {
    String requestId = DateTime.now().millisecondsSinceEpoch.toString();
    plugins.forEach((plugin) => {
      plugin.add('{"id": "$requestId", "type": "onQuery", "data": "$query"}')
    });
  }

  onOptionQuery(String onQueryId, String query) {
    String requestId = DateTime.now().millisecondsSinceEpoch.toString();
    plugins.forEach((plugin) => {
      plugin.add('{"id": "$requestId", "type": "onOptionQuery", "data": "$onQueryId##$query"}')
    });
  }

  execAction(String actionId) {
    String requestId = DateTime.now().millisecondsSinceEpoch.toString();
    plugins.forEach((plugin) => {
      plugin.add('{"id": "$requestId", "type": "execAction", "data": "$actionId"}')
    });
  }

  handleConnection(WebSocket socket) {
    plugins.add(socket);
    socket.listen((event) {
      var response = jsonDecode(event);

      if (response['type'] == 'renderOptions') {
        var options = List<Option>.from(
          response['data'].map<Option>((dynamic i) => Option.fromJson(i))
        );
        onNextOptions(options);
      }

      // socket.add('Echo: $event');
      // print(event.toString());
    });
  }
}


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

String getImagePath(String imageName) {
  return Platform.isWindows ? 'assets/$imageName.bmp' : 'assets/$imageName.png';
}

String getTrayImagePath(String imageName) {
  return Platform.isWindows ? 'assets/$imageName.ico' : 'assets/$imageName.png';
}

typedef Action = List<Option> Function();

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
      home: const Spotter(
        title: 'Flutter Demo Home Page',
      ),
    );
  }
}

class Spotter extends StatefulWidget {
  final String title;

  const Spotter({super.key, required this.title});

  @override
  State<Spotter> createState() => _SpotterState();
}

typedef OnOptionQuery = List<Option> Function(String query);
typedef OptionAction = bool Function();

class Option {
  final String name;
  final String? actionId;
  final String? onQueryId;
  final OnOptionQuery? onQuery;
  final OptionAction? action;

  Option({
    required this.name,
    this.actionId,
    this.onQueryId,
    this.onQuery,
    this.action,
  });

  Option.fromJson(Map<String, dynamic> json)
    : name = json['name'],
      actionId = json['actionId'],
      onQueryId = json['onQueryId'],
      onQuery = null,
      action = null;

  Map<String, dynamic> toJson() => {
    'name': name,
    'actionId': actionId,
    'onQueryId': onQueryId,
    'onQuery': onQuery,
    'action': action,
  };
}

class _SpotterState extends State<Spotter> {
  final AppWindow _appWindow = AppWindow();
  final SystemTray _systemTray = SystemTray();
  final Menu _menuMain = Menu();

  final textFieldController = TextEditingController();
  final scrollController = ScrollController();

  int selectedOptionIndex = 0;

  List<Option> options = [];

  List<Option> filteredOptions = [];

  Option? activatedOption;

  PluginsServer? pluginsServer;

  @override
  Widget build(BuildContext context) {


    options = [];
    options.add(Option(
      name: 'Plugins',
      onQuery: getPluginsMenu,
    ));

    var focusNode = FocusNode();
    KeyEventResult handleKeyEvent(RawKeyEvent event) {
      if (event is RawKeyUpEvent) {
        return KeyEventResult.ignored;
      }

      if (
        event.logicalKey == LogicalKeyboardKey.backspace
        && textFieldController.text.isEmpty
      ) {
        setState(() {
          activatedOption = null;
          filteredOptions = [];
        });
        return KeyEventResult.handled;
      }

      if (event.logicalKey == LogicalKeyboardKey.tab) {
        Option? selectedOption = filteredOptions[selectedOptionIndex];

        if (filteredOptions.length - 1 < selectedOptionIndex) {
          return KeyEventResult.ignored;
        }

        // if (selectedOption == null) {
        //   return KeyEventResult.ignored;
        // }

        if (selectedOption.onQueryId == null && selectedOption.onQuery == null) {
          windowManager.focus();
          return KeyEventResult.handled;
        }
        // if (selectedOption.action != null) {
        //   print("activate internal action");
        //   List<Option> nextOptions = selectedOption.action!();
        //   activatedOption = selectedOption;
        //   textFieldController.clear();
        //   setState(() {
        //     filteredOptions = nextOptions;
        //   });
        //   return KeyEventResult.handled;
        // }

        setState(() {
          activatedOption = filteredOptions[selectedOptionIndex];
          selectedOptionIndex = 0;
          filteredOptions = [];
        });
        textFieldController.clear();
        return KeyEventResult.handled;
      }

      if (event.logicalKey == LogicalKeyboardKey.enter) {
        onSubmit(filteredOptions[selectedOptionIndex]);
        return KeyEventResult.handled;
      }

      if (event.logicalKey == LogicalKeyboardKey.escape) {
        windowManager.hide();
        textFieldController.clear();
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
            height: 50,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: HexColor.fromHex('1c2128'),
              border: Border.all(color: HexColor.fromHex('#444c56'), width: 1), 
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
              child: Row(
                children: [
                  SizedBox(
                    width: activatedOption == null ? 0 : 120,
                    height: 50,
                    child: DecoratedBox(
                      decoration: const BoxDecoration(
                        color: Colors.blue,
                      ),
                      child: Container(
                        alignment: Alignment.center,
                        child: Text(
                          activatedOption?.name ?? '',
                        ),
                      ),
                    ),
                  ),
                  Flexible(
                    child: TextField(
                      // maxLines: 1,
                      // textAlignVertical: TextAlignVertical.center,
                      // textAlign: TextAlign.left,
                      controller: textFieldController,
                      textInputAction: TextInputAction.none,
                      autofocus: true,
                      style: TextStyle(
                        fontSize: 18.0,
                        color: HexColor.fromHex('#adbac7'),
                      ),
                      decoration: InputDecoration(
                        // filled: true,
                        // fillColor: Colors.grey,
                        border: InputBorder.none,
                        hintText: 'Query...',
                        hintStyle: TextStyle(
                          color: HexColor.fromHex('#768390'),
                        ),
                        isDense: true,
                        contentPadding: const EdgeInsets.only(left: 15),
                      )
                    ),
                  ),
                ],
              ),
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
                    // borderRadius: BorderRadius.only(
                    //   bottomLeft: Radius.circular(i == filteredOptions.length - 1 ? 10 : 0),
                    //   bottomRight: Radius.circular(i == filteredOptions.length - 1 ? 10 : 0),
                    // ),
                    border: Border(
                      left: BorderSide(width: 1, color: HexColor.fromHex('#444c56')),
                      right: BorderSide(width: 1, color: HexColor.fromHex('#444c56')),
                      bottom: BorderSide(width: 1, color: i == filteredOptions.length - 1 ? HexColor.fromHex('#444c56') : Colors.transparent),
                    ),
                    color: HexColor.fromHex('1c2128'),
                  ),
                  clipBehavior: Clip.hardEdge,
                  // height: 50,
                  width: double.infinity,
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    margin: EdgeInsets.only(top: i == 0 ? 2.0 : 0.0, left: 15.0, right: 15.0),
                    decoration: BoxDecoration(
                      color: selectedOptionIndex == i ? HexColor.fromHex('#539bf5') : HexColor.fromHex('1c2128'),
                      borderRadius: BorderRadius.circular(10),
                      // borderRadius: BorderRadius.only(
                      //   bottomLeft: Radius.circular(i == filteredOptions.length - 1 ? 10 : 0),
                      //   bottomRight: Radius.circular(i == filteredOptions.length - 1 ? 10 : 0),
                      // ),
                    ),
                    clipBehavior: Clip.hardEdge,
                    child: Text(
                      filteredOptions[i].name,
                      style: TextStyle(
                        fontSize: 15.0,
                        color: HexColor.fromHex(selectedOptionIndex == i ? '#cdd9e5' : '#adbac7'),
                      ),
                    ),
                  ),
                )
              ])
            )
          )
        ],
      ),
    );
  }

  @override
  void dispose() {
    textFieldController.dispose();
    super.dispose();
  }

  List<Option> getPluginsMenu(String query) {
    print(query);
    return [
      Option(name: 'Plugins child', onQuery: getPluginsMenu, action: installPlugin),
    ];
  }

  bool installPlugin() {
    print('install plguin');
    return true;
  }

  // TODO: remove after global hotkey fix
  Future<void> initServer() async {
    var server = await HttpServer.bind(InternetAddress.anyIPv6, 32123);
    await server.forEach((HttpRequest request) async {

      switch (request.uri.toString()) {
        case ('/open'):
          _appWindow.show();
          break;
        default:
      }
    
      request.response.close();
    });
  }

  @override
  void initState() {
    super.initState();

    initSystemTray();
    textFieldController.addListener(onQuery);

    initServer();

    pluginsServer = PluginsServer(onNextOptions);
    pluginsServer?.start();
  }

  void onNextOptions(List<Option> options) {
    setState(() {
      filteredOptions = options;
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

  void onQuery() {
    if (activatedOption != null && activatedOption!.onQueryId != null) {
      pluginsServer?.onOptionQuery(activatedOption!.onQueryId as String, textFieldController.text);
      return;
    }

    if (activatedOption != null && activatedOption!.onQuery != null) {
      var nextOptions = activatedOption!.onQuery!(textFieldController.text);
      setState(() {
        filteredOptions = nextOptions;
      });
      return;
    }

    pluginsServer?.onQuery(textFieldController.text);
    setState(() {
      selectedOptionIndex = 0;
      if (textFieldController.text.isEmpty) {
        filteredOptions = [];
        return;
      }
      filteredOptions = options.where((option) => option.name.toLowerCase().contains(textFieldController.text.toLowerCase())).toList();
    });
  }

  void onSubmit(Option option) async {
    if (option.actionId != null) {
      pluginsServer?.execAction(option.actionId as String);
    }

    if (option.action != null) {
      option.action!();
    }

    // TODO: check response from action
    windowManager.hide();
    textFieldController.clear();
    setState(() {
      filteredOptions = [];
    });

    // final uri = Uri.parse('http://localhost:34567/action');
    // final headers = {'Content-Type': 'application/json'};
    // Map<String, dynamic> body = {'actionId': actionId};
    // String jsonBody = json.encode(body);
    // final encoding = Encoding.getByName('utf-8');

    // Response response = await post(
    //   uri,
    //   headers: headers,
    //   body: jsonBody,
    //   encoding: encoding,
    // );

    // int statusCode = response.statusCode;
    // String responseBody = response.body;
    // print(responseBody);
  }

  void scrollToMakeOptionsVisible() {
    double nextOffset = (30 * (selectedOptionIndex - 5)).toDouble();

    scrollController.animateTo(
      nextOffset,
      duration: const Duration(milliseconds: 100),
      curve: Curves.linear,
    );
  }

  void selectNextOption() {
    setState(() {
      selectedOptionIndex = selectedOptionIndex >= filteredOptions.length - 1
        ? 0
        : selectedOptionIndex + 1;
    });
  }

  void selectPreviousOption() {
    setState(() {
      selectedOptionIndex = selectedOptionIndex <= 0
        ? filteredOptions.length - 1
        : selectedOptionIndex - 1;
    });
  }
}

extension HexColor on Color {
  String toHex({bool leadingHashSign = true}) => '${leadingHashSign ? '#' : ''}'
      '${alpha.toRadixString(16).padLeft(2, '0')}'
      '${red.toRadixString(16).padLeft(2, '0')}'
      '${green.toRadixString(16).padLeft(2, '0')}'
      '${blue.toRadixString(16).padLeft(2, '0')}';

  static Color fromHex(String hexString) {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  }
}
