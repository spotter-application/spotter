import 'dart:async';

import 'package:flutter/services.dart';

class WindowService {
  static const platform = MethodChannel('org.spotter-app');

  Future<void> show() async {
    try {
      await platform.invokeMethod('showWindow');
    } catch (e) {
      return;
    }
  }

  Future<void> hide() async {
    try {
      await platform.invokeMethod('hideWindow');
    } catch (e) {
      return;
    }
  }

}
