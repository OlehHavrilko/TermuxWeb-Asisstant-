import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _darkMode = true;
  bool _notifications = true;
  String _terminalShell = 'bash';
  String _terminalFontSize = '14';
  bool _autoUpdate = false;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _darkMode = prefs.getBool('darkMode') ?? true;
      _notifications = prefs.getBool('notifications') ?? true;
      _terminalShell = prefs.getString('terminalShell') ?? 'bash';
      _terminalFontSize = prefs.getString('terminalFontSize') ?? '14';
      _autoUpdate = prefs.getBool('autoUpdate') ?? false;
    });
  }

  Future<void> _saveSetting(String key, dynamic value) async {
    final prefs = await SharedPreferences.getInstance();
    if (value is bool) {
      await prefs.setBool(key, value);
    } else if (value is String) {
      await prefs.setString(key, value);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        children: [
          // Appearance Section
          _buildSectionHeader('Appearance'),
          SwitchListTile(
            title: const Text('Dark Mode'),
            subtitle: const Text('Use dark theme'),
            value: _darkMode,
            onChanged: (value) {
              setState(() => _darkMode = value);
              _saveSetting('darkMode', value);
            },
          ),
          const Divider(),

          // Terminal Section
          _buildSectionHeader('Terminal'),
          ListTile(
            title: const Text('Shell'),
            subtitle: Text(_terminalShell),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showShellPicker(),
          ),
          ListTile(
            title: const Text('Font Size'),
            subtitle: Text('$_terminalFontSize px'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showFontSizePicker(),
          ),
          const Divider(),

          // Notifications Section
          _buildSectionHeader('Notifications'),
          SwitchListTile(
            title: const Text('Enable Notifications'),
            subtitle: const Text('Get notified about script completions'),
            value: _notifications,
            onChanged: (value) {
              setState(() => _notifications = value);
              _saveSetting('notifications', value);
            },
          ),
          const Divider(),

          // Updates Section
          _buildSectionHeader('Updates'),
          SwitchListTile(
            title: const Text('Auto Update Packages'),
            subtitle: const Text('Automatically update package list'),
            value: _autoUpdate,
            onChanged: (value) {
              setState(() => _autoUpdate = value);
              _saveSetting('autoUpdate', value);
            },
          ),
          ListTile(
            title: const Text('Check for Updates'),
            subtitle: const Text('Version 1.0.0'),
            trailing: const Icon(Icons.system_update),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('You are on the latest version')),
              );
            },
          ),
          const Divider(),

          // About Section
          _buildSectionHeader('About'),
          ListTile(
            title: const Text('Termux Assistant'),
            subtitle: const Text('Version 1.0.0'),
            leading: const Icon(Icons.info_outline),
          ),
          ListTile(
            title: const Text('Open Source Licenses'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              showLicensePage(
                context: context,
                applicationName: 'Termux Assistant',
                applicationVersion: '1.0.0',
              );
            },
          ),
          ListTile(
            title: const Text('Source Code'),
            subtitle: const Text('View on GitHub'),
            leading: const Icon(Icons.code),
            onTap: () {
              // Open GitHub
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title,
        style: TextStyle(
          color: Theme.of(context).colorScheme.primary,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  void _showShellPicker() {
    showDialog(
      context: context,
      builder: (context) => SimpleDialog(
        title: const Text('Select Shell'),
        children: [
          _buildShellOption('bash', 'Bash (Default)'),
          _buildShellOption('zsh', 'Zsh'),
          _buildShellOption('sh', 'Sh'),
        ],
      ),
    );
  }

  Widget _buildShellOption(String shell, String name) {
    return SimpleDialogOption(
      onPressed: () {
        setState(() => _terminalShell = shell);
        _saveSetting('terminalShell', shell);
        Navigator.pop(context);
      },
      child: Row(
        children: [
          if (_terminalShell == shell)
            const Icon(Icons.check, color: Colors.green)
          else
            const SizedBox(width: 24),
          const SizedBox(width: 8),
          Text(name),
        ],
      ),
    );
  }

  void _showFontSizePicker() {
    showDialog(
      context: context,
      builder: (context) => SimpleDialog(
        title: const Text('Font Size'),
        children: [10, 12, 14, 16, 18, 20].map((size) {
          return SimpleDialogOption(
            onPressed: () {
              setState(() => _terminalFontSize = size.toString());
              _saveSetting('terminalFontSize', size.toString());
              Navigator.pop(context);
            },
            child: Row(
              children: [
                if (_terminalFontSize == size.toString())
                  const Icon(Icons.check, color: Colors.green)
                else
                  const SizedBox(width: 24),
                const SizedBox(width: 8),
                Text('$size px'),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}
