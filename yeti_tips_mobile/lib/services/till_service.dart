import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/till.dart';

class TillService {
  final String baseUrl;

  TillService({required this.baseUrl});

  Future<List<Till>> getTillsByDate(DateTime date) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/tills/today'),
    );
    if (response.statusCode == 200) {
      final List<dynamic> tillsJson = json.decode(response.body);
      return tillsJson.map((json) => Till.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load tills');
    }
  }

  Future<Till> createTill(Till till) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/tills'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(till.toJson()),
    );
    if (response.statusCode == 201) {
      return Till.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to create till');
    }
  }
}
