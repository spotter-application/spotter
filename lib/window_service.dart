import 'dart:async';
import 'dart:io';

import 'package:flutter/services.dart';
import 'package:window_manager/window_manager.dart';

class WindowService {
  static const platform = MethodChannel('org.spotter-app');

  Future<void> show() async {
    try {
      if (Platform.isLinux) {
        await windowManager.show();
        // await windowManager.focus();
        return;
      }
      await platform.invokeMethod('showWindow');
    } catch (e) {
      return;
    }
  }

  Future<void> hide() async {
    try {
      if (Platform.isLinux) {
        await windowManager.hide();
        return;
      }
      await platform.invokeMethod('hideWindow');
    } catch (e) {
      return;
    }
  }

}
