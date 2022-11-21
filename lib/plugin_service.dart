import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:observable/observable.dart';
import 'package:collection/collection.dart';
import 'package:flutter_pty/flutter_pty.dart';
import 'package:get_storage/get_storage.dart';
import 'package:process_run/shell.dart';

import 'api_service.dart';

typedef Action = bool Function(String query);
typedef OnNextOptions = void Function(List<Option> options);
typedef OnOptionQuery = List<Option> Function(String query);
typedef OptionAction = Future<bool> Function();

class Option {
  final String name;
  final String connectionId;
  final String? hint;
  final String? actionId;
  final String? onQueryId;
  final bool? important;
  final bool? isHovered;
  final int? priority;
  final String? icon;
  final OnOptionQuery? onQuery;
  final OptionAction? action;

  Option({
    required this.name,
    required this.connectionId,
    this.hint,
    this.actionId,
    this.onQueryId,
    this.important,
    this.isHovered,
    this.priority,
    this.icon,
    this.onQuery,
    this.action,
  });

  Option.fromJson(Map<String, dynamic> json)
      : name = json['name'],
        connectionId = json['connectionId'],
        hint = json['hint'],
        actionId = json['actionId'],
        onQueryId = json['onQueryId'],
        important = json['important'],
        isHovered = json['isHovered'],
        priority = json['priority'],
        icon = json['icon'],
        onQuery = null,
        action = null;

  Map<String, dynamic> toJson() => {
        'name': name,
        'connectionId': connectionId,
        'hint': hint,
        'actionId': actionId,
        'onQueryId': onQueryId,
        'important': important,
        'isHovered': isHovered,
        'priority': priority,
        'icon': icon,
        'onQuery': onQuery,
        'action': action,
      };
}

class PluginRequest {
  final String id;
  final String connectionId;
  final List<Option> options;
  final bool complete;

  PluginRequest({
    required this.id,
    required this.connectionId,
    required this.options,
    required this.complete,
  });

  PluginRequest.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        connectionId = json['connectionId'],
        options = json['options'].map<Option>((o) {
          o['connectionId'] = json['connectionId'];
          return Option.fromJson(o);
        }).toList(),
        complete = json['complete'];

  Map<String, dynamic> toJson() => {
        'id': id,
        'connectionId': connectionId,
        'options': options,
        'complete': complete,
      };
}

class PluginConnection {
  final String id;
  final WebSocket socket;

  PluginConnection({
    required this.id,
    required this.socket,
  });
}

class PluginsServer {
  final storage = GetStorage('spotter');
  List<PluginConnection> pluginConnections = List<PluginConnection>.from([]);
  final ApiService apiService = ApiService();
  final Shell shell = Shell();
  ObservableList<PluginRequest> requestsRegistry =
      ObservableList<PluginRequest>.from([]);

  start() async {
    HttpServer server = await HttpServer.bind('0.0.0.0', 4040);
    server.transform(WebSocketTransformer()).listen(_handleConnection);

    // storage.write('plugins_registry', []);
    storage.writeIfNull('plugins_registry', []);
    List<String> pluginsRegistry = await getPluginsRegistry();

    for (var plugin in pluginsRegistry) {
      Pty.start('plugins/$plugin');
    }
  }

  Future<List<String>> getPluginsRegistry() async {
    final storagePluginsRegistry = storage.read('plugins_registry') ?? [];
    final existingPlugins = <String>[];
    await Future.forEach(storagePluginsRegistry, (plugin) async {
      final pluginExists = await File('./plugins/$plugin').exists();
      if (pluginExists) {
        existingPlugins.add(plugin as String);
      }
    });
    return existingPlugins;
  }

  Future<bool> addPlugin(String plugin) async {
    List<String> pluginsRegistry = await getPluginsRegistry();

    bool alreadyRegistered = pluginsRegistry.firstWhereOrNull(
            (registeredPlugin) => registeredPlugin.contains(plugin)) !=
        null;

    if (alreadyRegistered) {
      return false;
    }

    // TODO: return lingle item
    List<ReleaseAsset>? assets =
        await apiService.getLatestReleaseAssets(plugin);

    if (assets == null) {
      return false;
    }

    await shell.run('mkdir -p plugins/$plugin');
    await Future.wait(assets.map((asset) async {
      String name = asset.name;
      String url = asset.url;
      await shell.run('curl -o plugins/$plugin/$name -LO "$url"');
      await shell.run('chmod 777 plugins/$plugin/$name');
      Pty.start('plugins/$plugin/$name');
      storage.write('plugins_registry', [...pluginsRegistry, '$plugin/$name']);
    }));

    return true;
  }

  removePlugin(String plugin) async {
    // await pluginsRegistryStorage.ready;
    // List<String> pluginsRegistry = pluginsRegistryStorage.getItem('plugins_registry');
    // pluginsRegistryStorage.setItem('plugins_registry', pluginsRegistry.where((p) => p != plugin));
    // TODO: kill process
    // kill -9 $(pidof 'plugin_name')
  }

  Future<PluginRequest> findPluginRequest(String requestId) async {
    Completer<PluginRequest> completer = Completer();
    // TODO: timer for long requests
    requestsRegistry.changes.listen((_) {
      final request = requestsRegistry.toList().firstWhereOrNull(
            (r) => r.id == requestId,
          );

      if (request != null) {
        requestsRegistry.remove(request);
        completer.complete(request);
      }
    });

    return completer.future;
  }

  Future<List<Option>> onQuery(String query) async {
    if (pluginConnections.isEmpty) {
      return [];
    }

    final options = <Option>[];
    await Future.forEach(pluginConnections, (connection) async {
      String requestId = DateTime.now().millisecondsSinceEpoch.toString();
      connection.socket
          .add('{"id": "$requestId", "type": "onQuery", "query": "$query"}');
      PluginRequest request = await findPluginRequest(requestId);
      options.addAll(request.options);
    });
    return options;
  }

  Future<List<Option>?> onOptionQuery(
      String onQueryId, String query, String connectionId) async {
    PluginConnection? connection = pluginConnections.firstWhereOrNull(
      (connection) => connection.id == connectionId,
    );

    if (connection == null) {
      return null;
    }

    String requestId = DateTime.now().millisecondsSinceEpoch.toString();
    connection.socket.add(
        '{"id": "$requestId", "type": "onOptionQuery", "onQueryId": "$onQueryId", "query": "$query"}');
    PluginRequest request = await findPluginRequest(requestId);
    return request.options;
  }

  Future<PluginRequest?> execAction(
      String actionId, String connectionId) async {
    PluginConnection? connection = pluginConnections.firstWhereOrNull(
      (connection) => connection.id == connectionId,
    );

    if (connection == null) {
      return null;
    }

    String requestId = DateTime.now().millisecondsSinceEpoch.toString();
    connection.socket.add(
        '{"id": "$requestId", "type": "execAction", "actionId": "$actionId"}');
    PluginRequest request = await findPluginRequest(requestId);
    return request;
  }

  _handleConnection(WebSocket socket) {
    String connectionId = DateTime.now().millisecondsSinceEpoch.toString();
    pluginConnections.add(PluginConnection(id: connectionId, socket: socket));
    // socket.handleError(() {
    //   // TODO: add
    // });

    socket.listen((event) {
      final json = jsonDecode(event);
      json['connectionId'] = connectionId;
      PluginRequest request = PluginRequest.fromJson(json);
      // TODO: clean up after closing
      requestsRegistry.add(request);
    }, onDone: () {
      pluginConnections
          .removeWhere((connection) => connection.id == connectionId);
    }, onError: (error) {
      pluginConnections
          .removeWhere((connection) => connection.id == connectionId);
    });
  }
}
