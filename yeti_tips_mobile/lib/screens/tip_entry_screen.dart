import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/tip.dart';
import '../services/tip_service.dart';
import 'package:intl/intl.dart';

class TipEntryScreen extends StatefulWidget {
  const TipEntryScreen({Key? key}) : super(key: key);

  @override
  _TipEntryScreenState createState() => _TipEntryScreenState();
}

class _TipEntryScreenState extends State<TipEntryScreen> {
  final _formKey = GlobalKey<FormState>();
  DateTime _selectedDate = DateTime.now();
  final _amountController = TextEditingController();
  List<bool> _selectedEmployees = [];
  List<TextEditingController> _distributionControllers = [];
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Enter Tips'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Date Picker
              ListTile(
                title: Text('Date: ${DateFormat('EEEE, MMMM d, yyyy').format(_selectedDate)}'),
                trailing: IconButton(
                  icon: const Icon(Icons.calendar_today),
                  onPressed: () async {
                    final DateTime? picked = await showDatePicker(
                      context: context,
                      initialDate: _selectedDate,
                      firstDate: DateTime(2020),
                      lastDate: DateTime(2025),
                    );
                    if (picked != null) {
                      setState(() {
                        _selectedDate = picked;
                      });
                    }
                  },
                ),
              ),

              // Total Amount
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8.0),
                child: TextFormField(
                  controller: _amountController,
                  decoration: const InputDecoration(
                    labelText: 'Total Tips ($)',
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.numberWithOptions(decimal: true),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter the tip amount';
                    }
                    if (double.tryParse(value) == null) {
                      return 'Please enter a valid number';
                    }
                    return null;
                  },
                ),
              ),

              // Employee Selection
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Select Working Employees',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      // TODO: Add employee checkboxes
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Distribution Preview
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Tip Distribution',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      // TODO: Add distribution fields
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Submit Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      // TODO: Submit tip entry
                    }
                  },
                  child: const Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Text('Record Tips'),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
