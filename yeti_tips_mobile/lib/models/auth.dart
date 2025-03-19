import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences.dart';
import 'package:http/http.dart' as http;

class User {
  final int id;
  final String username;
  final bool isAdmin;

  User({
    required this.id,
    required this.username,
    required this.isAdmin,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      isAdmin: json['isAdmin'] ?? false,
    );
  }
}

class AuthProvider with ChangeNotifier {
  User? _user;
  final String baseUrl;
  final SharedPreferences _prefs;

  AuthProvider({required this.baseUrl, required SharedPreferences prefs})
      : _prefs = prefs {
    // Try to restore session from SharedPreferences
    final userData = _prefs.getString('user');
    if (userData != null) {
      _user = User.fromJson(json.decode(userData));
      notifyListeners();
    }
  }

  User? get user => _user;
  bool get isAuthenticated => _user != null;

  Future<void> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'username': username,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final userData = json.decode(response.body);
      _user = User.fromJson(userData['user']);
      await _prefs.setString('user', json.encode(userData['user']));
      notifyListeners();
    } else {
      throw Exception('Failed to login');
    }
  }

  Future<void> logout() async {
    await http.post(Uri.parse('$baseUrl/api/auth/logout'));
    _user = null;
    await _prefs.remove('user');
    notifyListeners();
  }
}
