class Till {
  final int id;
  final DateTime date;
  final Map<String, int> denominations;
  final double total;

  Till({
    required this.id,
    required this.date,
    required this.denominations,
    required this.total,
  });

  factory Till.fromJson(Map<String, dynamic> json) {
    return Till(
      id: json['id'],
      date: DateTime.parse(json['date']),
      denominations: Map<String, int>.from(json['denominations']),
      total: double.parse(json['total']),
    );
  }

  Map<String, dynamic> toJson() => {
    'date': date.toIso8601String(),
    'denominations': denominations,
    'total': total.toString(),
  };
}
