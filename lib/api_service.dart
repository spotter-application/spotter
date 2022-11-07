import 'dart:convert';

import 'package:http/http.dart' as http;

class ReleaseAsset {
  final String name;
  final String url;

  ReleaseAsset({
    required this.name,
    required this.url,
  });
}

class ApiService {
  Future<List<ReleaseAsset>?> getLatestReleaseAssets(String plugin) async {
    var response = await http.get(Uri.parse('https://api.github.com/repos/$plugin/releases/latest'));
    if (response.statusCode == 200) {
      var body = jsonDecode(response.body);
      var assets = body['assets'].where((asset) => asset['name'].endsWith('-linux') || asset['name'].endsWith('-macos'));
      return assets.map<ReleaseAsset>((asset) => 
        ReleaseAsset(url: asset['browser_download_url'] as String, name: asset['name'] as String)
      ).toList();
    }
    return null;
  }
}

