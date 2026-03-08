import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({Key? key}) : super(key: key);
  @override
  _SettingsScreenState createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _isDark = true;
  double _fontSize = 14.0;
  String _shellPath = '/data/data/com.termux/files/usr/bin/bash';
  final TextEditingController _shellPathController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  @override
  void dispose() {
    _shellPathController.dispose();
    super.dispose();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      _isDark = prefs.getBool('isDark') ?? true;
      _fontSize = prefs.getDouble('fontSize') ?? 14.0;
      _shellPath = prefs.getString('shellPath') ?? '/data/data/com.termux/files/usr/bin/bash';
      _shellPathController.text = _shellPath;
    });
  }

  Future<void> _saveSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isDark', _isDark);
    await prefs.setDouble('fontSize', _fontSize);
    await prefs.setString('shellPath', _shellPath);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Settings Saved')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          SwitchListTile(
            title: const Text('Dark Theme'),
            value: _isDark,
            onChanged: (v) {
              setState(() => _isDark = v);
              _saveSettings();
            },
          ),
          const SizedBox(height: 16),
          const Text('Terminal Font Size'),
          Slider(
            value: _fontSize,
            min: 8,
            max: 32,
            divisions: 24,
            label: _fontSize.round().toString(),
            onChanged: (v) {
              setState(() => _fontSize = v);
            },
            onChangeEnd: (v) => _saveSettings(),
          ),
          const SizedBox(height: 16),
          TextField(
            decoration: const InputDecoration(labelText: 'Default Shell Path'),
            controller: _shellPathController,
            onChanged: (v) => _shellPath = v,
            onEditingComplete: _saveSettings,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _saveSettings,
            child: const Text('Save Settings'),
          )
        ],
      ),
    );
  }
}
