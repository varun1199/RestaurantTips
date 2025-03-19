import 'package:flutter/material.dart';
import '../models/till.dart';

class TillCalculatorScreen extends StatefulWidget {
  const TillCalculatorScreen({Key? key}) : super(key: key);

  @override
  _TillCalculatorScreenState createState() => _TillCalculatorScreenState();
}

class _TillCalculatorScreenState extends State<TillCalculatorScreen> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, double> denominations = {
    'nickels': 0.05,
    'dimes': 0.10,
    'quarters': 0.25,
    'ones': 1.00,
    'twos': 2.00,
    'fives': 5.00,
    'tens': 10.00,
    'twenties': 20.00,
    'fifties': 50.00,
    'hundreds': 100.00,
  };
  
  final Map<String, TextEditingController> controllers = {};
  double total = 0.0;

  @override
  void initState() {
    super.initState();
    // Initialize controllers for each denomination
    for (var denom in denominations.keys) {
      controllers[denom] = TextEditingController(text: '0');
    }
  }

  void calculateTotal() {
    double sum = 0.0;
    controllers.forEach((denom, controller) {
      final count = int.tryParse(controller.text) ?? 0;
      sum += count * denominations[denom]!;
    });
    setState(() {
      total = sum;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Till Calculator'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            ...denominations.entries.map((entry) {
              final denom = entry.key;
              final value = entry.value;
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 8.0),
                child: TextFormField(
                  controller: controllers[denom],
                  decoration: InputDecoration(
                    labelText: '\$${value.toStringAsFixed(2)}',
                    border: const OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.number,
                  onChanged: (_) => calculateTotal(),
                ),
              );
            }).toList(),

            const SizedBox(height: 24),

            // Total Display
            Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Total:',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    '\$${total.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Save Button
            ElevatedButton(
              onPressed: () {
                if (_formKey.currentState!.validate()) {
                  // TODO: Save till count
                }
              },
              child: const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text('Save Till Count'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    controllers.values.forEach((controller) => controller.dispose());
    super.dispose();
  }
}
