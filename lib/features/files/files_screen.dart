import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/services/termux_service.dart';

class FilesScreen extends StatefulWidget {
  const FilesScreen({Key? key}) : super(key: key);
  @override
  _FilesScreenState createState() => _FilesScreenState();
}

class _FilesScreenState extends State<FilesScreen> {
  String _currentPath = '/data/data/com.termux/files/home';
  List<String> _files = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadFiles();
  }

  Future<void> _loadFiles() async {
    setState(() => _isLoading = true);
    final termux = context.read<TermuxService>();
    final res = await termux.runCommand('ls -la "$_currentPath"');
    if (!mounted) return;
    setState(() {
      _files = res.split('\n').where((f) => f.trim().isNotEmpty && !f.startsWith('total')).toList();
      _isLoading = false;
    });
  }

  Future<void> _createFile() async {
    String name = '';
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('New File/Dir'),
        content: TextField(onChanged: (v) => name = v),
        actions: [
          TextButton(
            child: const Text('Create'),
            onPressed: () async {
              Navigator.pop(context);
              if (name.isNotEmpty) {
                final termux = context.read<TermuxService>();
                await termux.runCommand('touch "$_currentPath/$name"');
                _loadFiles();
              }
            },
          ),
        ],
      ),
    );
  }

  Future<void> _deleteFile(String name) async {
    final termux = context.read<TermuxService>();
    await termux.runCommand('rm -rf "$_currentPath/$name"');
    _loadFiles();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_currentPath.split('/').last),
        leading: IconButton(
          icon: const Icon(Icons.arrow_upward),
          onPressed: () {
            if (_currentPath != '/') {
              setState(() {
                _currentPath = _currentPath.substring(0, _currentPath.lastIndexOf('/'));
                if (_currentPath.isEmpty) _currentPath = '/';
              });
              _loadFiles();
            }
          },
        ),
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: _createFile),
        ],
      ),
      body: Column(
        children: [
          if (_isLoading) const LinearProgressIndicator(),
          Expanded(
            child: ListView.builder(
              itemCount: _files.length,
              itemBuilder: (context, index) {
                final fileLine = _files[index];
                final parts = fileLine.split(RegExp(r'\s+'));
                if (parts.length < 9) return const SizedBox();
                final name = parts.sublist(8).join(' ');
                final isDir = parts[0].startsWith('d');
                
                if (name == '.' || name == '..') return const SizedBox();

                return ListTile(
                  leading: Icon(isDir ? Icons.folder : Icons.insert_drive_file),
                  title: Text(name),
                  subtitle: Text(parts[0] + ' ' + parts[4] + ' bytes'),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete, color: Colors.red),
                    onPressed: () => _deleteFile(name),
                  ),
                  onTap: () {
                    if (isDir) {
                      setState(() => _currentPath = '$_currentPath/$name');
                      _loadFiles();
                    }
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
