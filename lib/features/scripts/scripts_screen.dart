import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/services/termux_service.dart';

class ScriptsScreen extends StatefulWidget {
  const ScriptsScreen({Key? key}) : super(key: key);
  @override
  _ScriptsScreenState createState() => _ScriptsScreenState();
}

class _ScriptsScreenState extends State<ScriptsScreen> {
  List<String> _scripts = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadScripts();
  }

  Future<void> _loadScripts() async {
    setState(() => _isLoading = true);
    final termux = context.read<TermuxService>();
    final res = await termux.runCommand('ls -1 /data/data/com.termux/files/home/*.sh');
    if (!mounted) return;
    setState(() {
      _scripts = res.split('\n').where((s) => s.trim().isNotEmpty && s.endsWith('.sh')).toList();
      _isLoading = false;
    });
  }

  Future<void> _runScript(String path) async {
    setState(() => _isLoading = true);
    final termux = context.read<TermuxService>();
    final res = await termux.runCommand('bash "$path"');
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Output: ${path.split('/').last}'),
        content: SingleChildScrollView(child: Text(res, style: const TextStyle(fontFamily: 'monospace'))),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK'))],
      ),
    );
    setState(() => _isLoading = false);
  }

  Future<void> _editScript(String path) async {
    final termux = context.read<TermuxService>();
    final content = await termux.runCommand('cat "$path"');
    final controller = TextEditingController(text: content);
    
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Edit: ${path.split('/').last}'),
        content: TextField(controller: controller, maxLines: null, keyboardType: TextInputType.multiline),
        actions: [
          TextButton(
            child: const Text('Save'),
            onPressed: () async {
              Navigator.pop(context);
              final encoded = base64Encode(utf8.encode(controller.text));
              await termux.runCommand('echo "$encoded" | base64 -d > "$path"');
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scripts'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadScripts),
        ],
      ),
      body: Column(
        children: [
          if (_isLoading) const LinearProgressIndicator(),
          Expanded(
            child: ListView.builder(
              itemCount: _scripts.length,
              itemBuilder: (context, index) {
                final path = _scripts[index];
                final name = path.split('/').last;
                return ListTile(
                  leading: const Icon(Icons.code),
                  title: Text(name),
                  subtitle: Text(path),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(icon: const Icon(Icons.edit, color: Colors.blue), onPressed: () => _editScript(path)),
                      IconButton(icon: const Icon(Icons.play_arrow, color: Colors.green), onPressed: () => _runScript(path)),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        child: const Icon(Icons.add),
        onPressed: () async {
          String name = '';
          await showDialog(
            context: context,
            builder: (_) => AlertDialog(
              title: const Text('New Script'),
              content: TextField(onChanged: (v) => name = v, decoration: const InputDecoration(hintText: 'name.sh')),
              actions: [
                TextButton(
                  child: const Text('Create'),
                  onPressed: () async {
                    Navigator.pop(context);
                    if (name.isNotEmpty) {
                      if (!name.endsWith('.sh')) name += '.sh';
                      await context.read<TermuxService>().runCommand('touch "/data/data/com.termux/files/home/$name"');
                      _loadScripts();
                    }
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
