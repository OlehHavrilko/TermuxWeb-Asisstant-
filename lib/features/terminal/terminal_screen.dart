import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/services/termux_service.dart';

class TerminalScreen extends StatefulWidget {
  const TerminalScreen({Key? key}) : super(key: key);
  @override
  _TerminalScreenState createState() => _TerminalScreenState();
}

class _TerminalScreenState extends State<TerminalScreen> {
  final TextEditingController _cmdController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  String _output = '';
  bool _isLoading = false;

  @override
  void dispose() {
    _cmdController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _runCmd() async {
    final cmd = _cmdController.text.trim();
    if (cmd.isEmpty) return;
    
    setState(() {
      _isLoading = true;
      _output += '\n\$ $cmd\n';
    });
    
    final termux = context.read<TermuxService>();
    final res = await termux.runCommand(cmd);
    
    if (!mounted) return;
    setState(() {
      _output += res;
      _isLoading = false;
      _cmdController.clear();
    });
    
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Terminal')),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              controller: _scrollController,
              padding: const EdgeInsets.all(8.0),
              child: Align(
                alignment: Alignment.topLeft,
                child: Text(_output, style: const TextStyle(fontFamily: 'monospace')),
              ),
            ),
          ),
          if (_isLoading) const LinearProgressIndicator(),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                const Text('\$ ', style: TextStyle(fontWeight: FontWeight.bold)),
                Expanded(
                  child: TextField(
                    controller: _cmdController,
                    decoration: const InputDecoration(
                      hintText: 'Enter command',
                      border: InputBorder.none,
                    ),
                    onSubmitted: (_) => _runCmd(),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: _runCmd,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
