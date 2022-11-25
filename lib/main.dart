import 'dart:async';
import 'dart:io';
import 'dart:ffi' as ffi;

import 'package:flutter/material.dart' hide MenuItem;
import 'package:flutter/services.dart';
import 'package:hotkey_manager/hotkey_manager.dart';
import 'package:system_tray/system_tray.dart';
import 'package:window_manager/window_manager.dart'; // TODO: remove and use local window service
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get_storage/get_storage.dart';
import 'package:process_run/shell.dart';
import 'package:launch_at_startup/launch_at_startup.dart';
import 'package:package_info_plus/package_info_plus.dart';

import 'plugin_service.dart';
import 'window_service.dart';

List<String> plugins = [
  'spotter-application/applications-plugin',
  'spotter-application/calculator-plugin',
  'spotter-application/ml-plugin',
  'spotter-application/projects-plugin'
];

typedef ScaleFunc = ffi.Double Function();
typedef Scale = double Function();
double deviceScale = 1;
double windowWidth = 1000;
double windowHeight = 450;

PluginsServer pluginsServer = PluginsServer();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (Platform.isLinux) {
    final size = await windowManager.getSize();
    deviceScale = size.width / 800;
  }

  await GetStorage.init('spotter');

  PackageInfo packageInfo = await PackageInfo.fromPlatform();

  launchAtStartup.setup(
    appName: packageInfo.appName,
    appPath: Platform.resolvedExecutable,
  );

  bool isLaunchAtStartupEnabled = await launchAtStartup.isEnabled();

  if (!isLaunchAtStartupEnabled) {
    await launchAtStartup.enable();
  }

  await windowManager.ensureInitialized();
  // WindowOptions windowOptions = const WindowOptions(
  //   size: Size(800, 600),
  //   center: true,
  //   backgroundColor: Colors.yellow,
  //   skipTaskbar: false,
  //   titleBarStyle: TitleBarStyle.hidden,
  // );
  // windowManager.waitUntilReadyToShow(windowOptions, () async {
  //   // await windowManager.show();
  //   // await windowManager.focus();
  // });

  await hotKeyManager.unregisterAll();

  // windowWidth = (800 * deviceScale);
  // windowHeight = (150 * deviceScale);
  // final initialSize = Size(windowWidth, windowHeight);

  // doWhenWindowReady(() {
  //   appWindow.minSize = initialSize;
  //   appWindow.maxSize = initialSize;
  //   appWindow.size = initialSize;
  //   appWindow.alignment = Alignment.center;
  //   appWindow.hide();
  //   // appWindow.show();
  // });
  // await hotKeyManager.unregisterAll();

  final WindowService windowService = WindowService();

  HotKey openHotKey = HotKey(
    KeyCode.space,
    modifiers: [KeyModifier.alt],
  );
  // Set hotkey scope (default is HotKeyScope.system)
  // scope: HotKeyScope.inapp, // Set as inapp-wide hotkey.
  await hotKeyManager.register(
    openHotKey,
    keyDownHandler: (hotKey) {
      pluginsServer.onOpenSpotter();
      windowService.show();
      print('onKeyDown+${hotKey.toJson()}');
    },
    // Only works on macOS.
    keyUpHandler: (hotKey) {
      print('onKeyUp+${hotKey.toJson()}');
    },
  );

  // HotKey closeHotKey = HotKey(
  //   KeyCode.escape,
  //   modifiers: [KeyModifier.control],
  //   scope: HotKeyScope.inapp,
  // );
  // // final AppWindow appWindow = AppWindow();
  // await hotKeyManager.register(
  //   closeHotKey,
  //   keyDownHandler: (hotKey) async {
  //     print("CLOSE");
  //     print('onKeyDown+${hotKey.toJson()}');
  //     await windowManager.hide();
  //     // await windowManager.show();
  //   },
  // );

  runApp(const MyApp());
}

String getImagePath(String imageName) {
  return Platform.isWindows
      ? 'assets/spotter.bmp'
      : 'assets/resources/spotter.png';
}

String getTrayImagePath(String imageName) {
  return Platform.isWindows
      ? 'assets/spotter.ico'
      : 'assets/resources/spotter.png';
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Spotter',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        scaffoldBackgroundColor: Colors.transparent,
      ),
      home: const Spotter(),
    );
  }
}

class Spotter extends StatefulWidget {
  const Spotter({super.key});

  @override
  State<Spotter> createState() => _SpotterState();
}

class _SpotterState extends State<Spotter> {
  final AppWindow _appWindow = AppWindow();
  final SystemTray _systemTray = SystemTray();
  final Menu _menuMain = Menu();
  final Shell shell = Shell();
  final WindowService windowService = WindowService();

  final textFieldController = TextEditingController();
  final scrollController = ScrollController();

  int selectedOptionIndex = 0;

  List<Option> options = [];

  List<Option> filteredOptions = [];

  List<Option> activatedOptions = [];

  bool loading = false;

  final textFieldFocusNode = FocusNode();

  @override
  Widget build(BuildContext context) {
    options = [];
    options.add(Option(
      name: 'Plugins',
      connectionId: '',
      onQuery: getPluginsMenu,
    ));

    final focusNode = FocusNode();

    KeyEventResult handleKeyEvent(RawKeyEvent event) {
      if (event is RawKeyUpEvent) {
        return KeyEventResult.ignored;
      }

      if (event.logicalKey == LogicalKeyboardKey.escape) {
        // if (loading) {
        //   //Save state
        //   windowService.hide();
        //   return KeyEventResult.handled;
        // }

        windowService.hide();
        textFieldController.clear();
        setState(() {
          filteredOptions = [];
          activatedOptions = [];
          selectedOptionIndex = 0;
        });
        return KeyEventResult.handled;
      }

      // if (loading) {
      //   return KeyEventResult.handled;
      // }

      if (event.logicalKey == LogicalKeyboardKey.backspace &&
          textFieldController.text.isEmpty) {
        setState(() {
          if (activatedOptions.isNotEmpty) {
            activatedOptions.removeLast();
          }
          filteredOptions = [];
        });

        if (activatedOptions.isNotEmpty) {
          onQuery();
        }
        return KeyEventResult.handled;
      }

      if (event.logicalKey == LogicalKeyboardKey.tab) {
        Option? selectedOption = filteredOptions.isEmpty
            ? null
            : filteredOptions[selectedOptionIndex];

        if (selectedOption == null) {
          textFieldFocusNode.nextFocus();
          return KeyEventResult.handled;
        }

        if (selectedOption.onQueryId == null &&
            selectedOption.onQuery == null) {
          textFieldFocusNode.nextFocus();
          return KeyEventResult.handled;
        }

        setState(() {
          activatedOptions.add(filteredOptions[selectedOptionIndex]);
          selectedOptionIndex = 0;
          filteredOptions = [];
        });
        textFieldController.clear();

        onQuery();
        return KeyEventResult.handled;
      }

      if (event.logicalKey == LogicalKeyboardKey.enter) {
        print(deviceScale);
        onSubmit(filteredOptions[selectedOptionIndex]);
        return KeyEventResult.handled;
      }

      bool next = (event.isControlPressed &&
              event.logicalKey == LogicalKeyboardKey.keyN) ||
          event.logicalKey == LogicalKeyboardKey.arrowDown;

      if (next) {
        selectNextOption();
        scrollToMakeOptionsVisible();
        return KeyEventResult.ignored;
      }

      bool previous = (event.isControlPressed &&
              event.logicalKey == LogicalKeyboardKey.keyP) ||
          event.logicalKey == LogicalKeyboardKey.arrowUp;

      if (previous) {
        selectPreviousOption();
        scrollToMakeOptionsVisible();
        return KeyEventResult.ignored;
      }

      return KeyEventResult.ignored;
    }

    double width = MediaQuery.of(context).size.width;
    double height = MediaQuery.of(context).size.height;
    return Scaffold(
      body: Container(
        alignment: Alignment.topCenter,
        transform: Matrix4(
          deviceScale, 0, 0, 0, //
          0, deviceScale, 0, 0, //
          0, 0, 1, 0, //
          0, 0, 0, 1,
        ),
        width: width / deviceScale,
        height: height / deviceScale,
        color: Colors.transparent,
        child: Column(
          children: <Widget>[
            Container(
              height: 55,
              decoration: BoxDecoration(
                color: HexColor.fromHex('1c2128'),
                border:
                    Border.all(color: HexColor.fromHex('#2b3137'), width: 1),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(10),
                  topRight: const Radius.circular(10),
                  bottomLeft: Radius.circular(filteredOptions.isEmpty ? 10 : 0),
                  bottomRight:
                      Radius.circular(filteredOptions.isEmpty ? 10 : 0),
                ),
              ),
              clipBehavior: Clip.hardEdge,
              child: RawKeyboardListener(
                focusNode: focusNode,
                onKey: handleKeyEvent,
                child: Row(
                  children: [
                    Row(
                      children: [
                        for (var i = 0; i < activatedOptions.length; i++)
                          Container(
                            margin: const EdgeInsets.only(
                              top: 8,
                              bottom: 8,
                              left: 8,
                            ),
                            child: LimitedBox(
                              maxWidth: 200,
                              child: Container(
                                // alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: HexColor.fromHex('#539bf5'),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                // TODO: check cutted text
                                padding: const EdgeInsets.all(10),
                                child: Text(
                                  activatedOptions[i].name,
                                  style: TextStyle(
                                    fontSize: 15.0,
                                    color: HexColor.fromHex('#cdd9e5'),
                                  ),
                                ),
                              ),
                            ),
                          )
                      ],
                    ),
                    Flexible(
                      child: TextField(
                          controller: textFieldController,
                          focusNode: textFieldFocusNode,
                          textInputAction: TextInputAction.none,
                          autofocus: true,
                          style: TextStyle(
                            fontSize: 20.0,
                            color: HexColor.fromHex('#adbac7'),
                          ),
                          decoration: InputDecoration(
                            border: InputBorder.none,
                            hintText: 'Query...',
                            hintStyle: TextStyle(
                              color: HexColor.fromHex('#768390'),
                            ),
                            isDense: true,
                            contentPadding: const EdgeInsets.only(left: 8),
                          )),
                    ),
                    SizedBox(
                      height: 50,
                      child: Container(
                        padding: const EdgeInsets.only(right: 12),
                        alignment: Alignment.center,
                        child: SizedBox(
                          height: 16.0,
                          width: 16.0,
                          child: loading
                              ? CircularProgressIndicator(
                                  strokeWidth: 1,
                                  color: HexColor.fromHex('#adbac7'),
                                )
                              : null,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            LimitedBox(
              maxHeight: 30 * 10,
              // decoration: BoxDecoration(
              // border: Border.all(color: HexColor.fromHex('#2b3137'), width: 1),
              // borderRadius: BorderRadius.only(
              //   bottomLeft: const Radius.circular(10),
              //   bottomRight: const Radius.circular(10),
              //   topLeft: Radius.circular(filteredOptions.isEmpty ? 10 : 0),
              //   topRight: Radius.circular(filteredOptions.isEmpty ? 10 : 0),
              // ),
              // color: HexColor.fromHex('1c2128'),
              // ),
              // clipBehavior: Clip.hardEdge,
              child: Container(
                decoration: BoxDecoration(
                  color: HexColor.fromHex('1c2128'),
                  border:
                      Border.all(color: HexColor.fromHex('#2b3137'), width: 1),
                  borderRadius: BorderRadius.only(
                    bottomLeft: const Radius.circular(10),
                    bottomRight: const Radius.circular(10),
                    topLeft: Radius.circular(filteredOptions.isEmpty ? 10 : 0),
                    topRight: Radius.circular(filteredOptions.isEmpty ? 10 : 0),
                  ),
                ),
                child: SingleChildScrollView(
                  controller: scrollController,
                  child: Column(
                    children: [
                      for (var i = 0; i < filteredOptions.length; i++)
                        SizedBox(
                          width: double.infinity,
                          child: Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(10),
                              color: selectedOptionIndex == i
                                  ? HexColor.fromHex('#539bf5')
                                  : Colors.transparent,
                            ),
                            padding: const EdgeInsets.all(10),
                            margin: EdgeInsets.only(
                              top: i == 0 ? 8 : 0,
                              bottom: i == filteredOptions.length - 1 ? 8 : 0,
                              left: 8,
                              right: 8,
                            ),
                            child: Row(
                              children: [
                                filteredOptions[i].icon != null
                                    ? Padding(
                                        padding:
                                            const EdgeInsets.only(right: 8),
                                        child: filteredOptions[i]
                                                .icon!
                                                .endsWith('.png')
                                            ? Image.asset(
                                                filteredOptions[i].icon
                                                    as String,
                                                fit: BoxFit.contain,
                                                width: 20,
                                              )
                                            : SvgPicture.asset(
                                                filteredOptions[i].icon
                                                    as String,
                                                fit: BoxFit.contain,
                                                width: 20,
                                              ),
                                      )
                                    : const SizedBox.shrink(),
                                Text(
                                  filteredOptions[i].name,
                                  style: TextStyle(
                                    fontSize: 15.0,
                                    color: HexColor.fromHex(
                                        selectedOptionIndex == i
                                            ? '#cdd9e5'
                                            : '#adbac7'),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    textFieldController.dispose();
    super.dispose();
  }

  List<Option> getPluginsMenu(String query) {
    // TODO: add list of installed plugins
    return [
      Option(
          name: 'Install plugins',
          connectionId: '',
          onQuery: getPluginsToInstallMenu)
    ];
  }

  List<Option> getPluginsToInstallMenu(String query) {
    return plugins
        .map<Option>((plugin) => Option(
            name: plugin,
            connectionId: '',
            action: () => installPlugin(plugin)))
        .toList();
  }

  Future<bool> installPlugin(String plugin) async {
    return await pluginsServer.installPlugin(plugin);
  }

  // TODO: remove after global hotkey fix
  Future<void> initServer() async {
    var server = await HttpServer.bind(InternetAddress.anyIPv6, 32123);
    await server.forEach((HttpRequest request) async {
      switch (request.uri.toString()) {
        case ('/open'):
          textFieldFocusNode.requestFocus();
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
    initSpotter();
  }

  void initSpotter() async {
    initSystemTray();
    textFieldController.addListener(onQuery);

    initServer();

    setState(() {
      loading = true;
    });

    print('start');

    await pluginsServer.start();

    print('started');

    setState(() {
      loading = false;
    });

    pluginsServer.mlSuggestionsRegistry.changes.listen((_) {
      List<String> mlSuggestions = pluginsServer.mlSuggestionsRegistry.toList();
      print("-------------------------------- object");
    });
  }

  void onNextOptions(List<Option> options) {
    setState(() {
      filteredOptions = options;
    });
  }

  Future<void> initSystemTray() async {
    await _systemTray.initSystemTray(iconPath: getTrayImagePath('app_icon'));
    _systemTray.setTitle("Spotter");

    _systemTray.registerSystemTrayEventHandler((eventName) {
      debugPrint("eventName: $eventName");
      if (eventName == kSystemTrayEventClick) {
        Platform.isWindows ? _appWindow.show() : _systemTray.popUpContextMenu();
      } else if (eventName == kSystemTrayEventRightClick) {
        Platform.isWindows ? _systemTray.popUpContextMenu() : _appWindow.show();
      }
    });

    await _menuMain.buildFrom([
      MenuItemLabel(
        label: 'Show',
        image: getImagePath('darts_icon'),
        onClicked: (menuItem) async => {
          await windowService.show(),
        },
      ),
      MenuItemLabel(
          label: 'Hide',
          image: getImagePath('darts_icon'),
          onClicked: (menuItem) => _appWindow.hide()),
      MenuSeparator(),
      MenuItemLabel(label: 'Exit', onClicked: (menuItem) => _appWindow.close()),
    ]);

    _systemTray.setContextMenu(_menuMain);
  }

  void onQuery() async {
    if (activatedOptions.isNotEmpty &&
        activatedOptions.last.onQueryId != null) {
      List<Option>? nextOptions = await pluginsServer.onOptionQuery(
        activatedOptions.last.onQueryId as String,
        textFieldController.text,
        activatedOptions.last.connectionId,
      );

      setState(() {
        filteredOptions = nextOptions ?? [];
      });
      return;
    }

    if (activatedOptions.isNotEmpty && activatedOptions.last.onQuery != null) {
      List<Option> nextOptions =
          activatedOptions.last.onQuery!(textFieldController.text);
      setState(() {
        filteredOptions = nextOptions;
      });
      return;
    }

    List<Option> pluginsOptions =
        await pluginsServer.onQuery(textFieldController.text);
    List<Option> nextOptions = [...pluginsOptions, ...options];

    setState(() {
      selectedOptionIndex = 0;
      filteredOptions = nextOptions
          // .where((option) =>
          //     option.important == true ||
          //     option.name
          //         .toLowerCase()
          //         .contains(textFieldController.text.toLowerCase()))
          .toList()
        ..sort((a, b) {
          String query = textFieldController.text.toLowerCase();
          String aName = a.name.toLowerCase();
          String bName = b.name.toLowerCase();
          if (aName.startsWith(query) && !bName.startsWith(query)) {
            return -1;
          }

          if (bName.startsWith(query) && !aName.startsWith(query)) {
            return 1;
          }

          return aName.compareTo(bName);
        });
      // if (textFieldController.text.isEmpty) {
      //   filteredOptions = [];
      //   return;
      // }
    });
  }

  void onSubmit(Option option) async {
    setState(() {
      loading = true;
    });

    final mlGlobalActionPath =
        [...activatedOptions, option].map((e) => e.name).join('#####');
    pluginsServer.mlSendGlobalActionPath(mlGlobalActionPath);

    if (option.actionId != null) {
      ResponseWithOptionsFromPlugin? response = await pluginsServer.execAction(
        option.actionId as String,
        option.connectionId,
      );
      setState(() {
        loading = false;
        filteredOptions =
            response != null && response.complete ? [] : response!.options;
      });

      windowService.hide();
      textFieldController.clear();
      return;
    }

    if (option.action != null) {
      bool result = await option.action!();

      setState(() {
        loading = false;
      });

      if (!result) {
        return;
      }
    }

    windowService.hide();
    textFieldController.clear();
    setState(() {
      loading = false;
      filteredOptions = [];
      activatedOptions = [];
    });
  }

  void scrollToMakeOptionsVisible() {
    double nextOffset = (40 * (selectedOptionIndex - 5)).toDouble();

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
