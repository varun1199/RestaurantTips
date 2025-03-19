import 'package:intl/intl.dart';

class Tip {
  final int id;
  final DateTime date;
  final double amount;
  final int numEmployees;
  final List<TipDistribution> distributions;

  Tip({
    required this.id,
    required this.date,
    required this.amount,
    required this.numEmployees,
    required this.distributions,
  });

  factory Tip.fromJson(Map<String, dynamic> json) {
    return Tip(
      id: json['id'],
      date: DateTime.parse(json['date']),
      amount: double.parse(json['amount']),
      numEmployees: int.parse(json['numEmployees']),
      distributions: (json['distributions'] as List)
          .map((d) => TipDistribution.fromJson(d))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
    'date': DateFormat('yyyy-MM-dd').format(date),
    'amount': amount.toString(),
    'numEmployees': numEmployees.toString(),
    'distributions': distributions.map((d) => d.toJson()).toList(),
  };
}

class TipDistribution {
  final int employeeId;
  final String employeeName;
  final double amount;

  TipDistribution({
    required this.employeeId,
    required this.employeeName,
    required this.amount,
  });

  factory TipDistribution.fromJson(Map<String, dynamic> json) {
    return TipDistribution(
      employeeId: json['employeeId'],
      employeeName: json['employeeName'],
      amount: double.parse(json['amount']),
    );
  }

  Map<String, dynamic> toJson() => {
    'employeeId': employeeId,
    'employeeName': employeeName,
    'amount': amount.toString(),
  };
}
