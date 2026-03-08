import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/services/termux_service.dart';

class ScriptsPage extends StatefulWidget {
  const ScriptsPage({super.key});

  @override
  State<ScriptsPage> createState() => _ScriptsPageState();
}

class _ScriptsPageState extends State<ScriptsPage> {
  List<Script> _scripts = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadScripts();
  }

  Future<void> _loadScripts() async {
    setState(() => _isLoading = true);
    
    try {
      final termuxService = context.read<TermuxService>();
      final result = await termuxService.executeBash(
        'ls -la /data/data/com.termux/files/home/*.sh /data/data/com.termux/files/home/scripts/*.sh 2>/dev/null',
      );
      
      if (result.isSuccess && result.output.isNotEmpty) {
        final scripts = <Script>[];
        final lines = result.output.split('\n');
        
        for (final line in lines) {
          if (line.trim().isEmpty || line.startsWith('total')) continue;
          
          final parts = line.split(RegExp(r'\s+'));
          if (parts.length >= 9) {
            final path = parts.sublist(8).join(' ');
            if (path.endsWith('.sh')) {
              scripts.add(Script(
                name: path.split('/').last,
                path: path,
                language: 'bash',
              ));
            }
          }
        }
        
        setState(() => _scripts = scripts);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _createScript() async {
    final name = await _showNameDialog('Create Script');
    if (name != null && name.isNotEmpty) {
      final scriptName = name.endsWith('.sh') ? name : '$name.sh';
      final path = '/data/data/com.termux/files/home/scripts/$scriptName';
      
      final termuxService = context.read<TermuxService>();
      await termuxService.createDirectory('/data/data/com.termux/files/home/scripts');
      await termuxService.writeFile(path, '#!/bin/bash\n\n');
      _loadScripts();
    }
  }

  Future<String?> _showNameDialog(String title) async {
    final controller = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Script name (e.g., myscript.sh)',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, controller.text),
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }

  Future<void> _editScript(Script script) async {
    final termuxService = context.read<TermuxService>();
    final content = await termuxService.readFile(script.path);
    
    if (!mounted) return;
    
    final result = await showDialog<String>(
      context: context,
      builder: (context) => _EditScriptDialog(
        name: script.name,
        content: content,
      ),
    );
    
    if (result != null) {
      await termuxService.writeFile(script.path, result);
      _loadScripts();
    }
  }

  Future<void> _runScript(Script script) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Run Script'),
        content: Text('Execute ${script.name}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Run'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      setState(() => _isLoading = true);
      
      final termuxService = context.read<TermuxService>();
      final result = await termuxService.executeBash('bash "${script.path}"');
      
      setState(() => _isLoading = false);
      
      if (!mounted) return;
      
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(result.isSuccess ? 'Success' : 'Error'),
          content: SingleChildScrollView(
            child: SelectableText(
              result.isSuccess ? result.output : result.error,
              style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close'),
            ),
          ],
        ),
      );
    }
  }

  Future<void> _deleteScript(Script script) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Script'),
        content: Text('Delete ${script.name}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final termuxService = context.read<TermuxService>();
      await termuxService.deleteFile(script.path);
      _loadScripts();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scripts'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadScripts,
            tooltip: 'Refresh',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _createScript,
        child: const Icon(Icons.add),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _scripts.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.code_off, size: 64),
                      const SizedBox(height: 16),
                      const Text('No scripts found'),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: _createScript,
                        icon: const Icon(Icons.add),
                        label: const Text('Create Script'),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  itemCount: _scripts.length,
                  itemBuilder: (context, index) {
                    final script = _scripts[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      child: ListTile(
                        leading: const Icon(Icons.code),
                        title: Text(script.name),
                        subtitle: Text(script.path),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.play_arrow),
                              onPressed: () => _runScript(script),
                              tooltip: 'Run',
                            ),
                            IconButton(
                              icon: const Icon(Icons.edit),
                              onPressed: () => _editScript(script),
                              tooltip: 'Edit',
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete, color: Colors.red),
                              onPressed: () => _deleteScript(script),
                              tooltip: 'Delete',
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}

class Script {
  final String name;
  final String path;
  final String language;

  Script({
    required this.name,
    required this.path,
    required this.language,
  });
}

class _EditScriptDialog extends StatefulWidget {
  final String name;
  final String content;

  const _EditScriptDialog({
    required this.name,
    required this.content,
  });

  @override
  State<_EditScriptDialog> createState() => _EditScriptDialogState();
}

class _EditScriptDialogState extends State<_EditScriptDialog> {
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.content);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.name),
      content: SizedBox(
        width: MediaQuery.of(context).size.width * 0.8,
        height: MediaQuery.of(context).size.height * 0.6,
        child: TextField(
          controller: _controller,
          maxLines: null,
          expands: true,
          style: const TextStyle(fontFamily: 'monospace', fontSize: 14),
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
            hintText: 'Enter script content...',
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () => Navigator.pop(context, _controller.text),
          child: const Text('Save'),
        ),
      ],
    );
  }
}
