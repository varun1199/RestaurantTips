import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/tip.dart';

class TipService {
  final String baseUrl;

  TipService({required this.baseUrl});

  Future<List<Tip>> getTips() async {
    final response = await http.get(Uri.parse('$baseUrl/api/tips'));
    if (response.statusCode == 200) {
      final List<dynamic> tipsJson = json.decode(response.body);
      return tipsJson.map((json) => Tip.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load tips');
    }
  }

  Future<Tip> createTip(Tip tip) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/tips'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(tip.toJson()),
    );
    if (response.statusCode == 201) {
      return Tip.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to create tip');
    }
  }

  Future<void> deleteTip(int id) async {
    final response = await http.delete(Uri.parse('$baseUrl/api/tips/$id'));
    if (response.statusCode != 200) {
      throw Exception('Failed to delete tip');
    }
  }
}
