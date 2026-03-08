import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/services/termux_service.dart';

class PackagesScreen extends StatefulWidget {
  const PackagesScreen({Key? key}) : super(key: key);
  @override
  _PackagesScreenState createState() => _PackagesScreenState();
}

class _PackagesScreenState extends State<PackagesScreen> {
  List<String> _packages = [];
  bool _isLoading = false;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadPackages();
  }

  Future<void> _loadPackages() async {
    setState(() => _isLoading = true);
    final termux = context.read<TermuxService>();
    final res = await termux.runCommand('pkg list-installed');
    if (!mounted) return;
    setState(() {
      _packages = res.split('\n').where((p) => p.trim().isNotEmpty && !p.startsWith('Listing')).toList();
      _isLoading = false;
    });
  }

  Future<void> _searchPackages(String query) async {
    if (query.isEmpty) {
      _loadPackages();
      return;
    }
    setState(() => _isLoading = true);
    final termux = context.read<TermuxService>();
    final res = await termux.runCommand('pkg search $query');
    if (!mounted) return;
    setState(() {
      _packages = res.split('\n').where((p) => p.trim().isNotEmpty).toList();
      _isLoading = false;
    });
  }

  Future<void> _managePackage(String pkg, String action) async {
    setState(() => _isLoading = true);
    final termux = context.read<TermuxService>();
    final res = await termux.runCommand('pkg $action -y $pkg');
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(res.split('\n').last)));
    _loadPackages();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Packages')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search packages',
                suffixIcon: IconButton(
                  icon: const Icon(Icons.search),
                  onPressed: () => _searchPackages(_searchController.text),
                ),
              ),
              onSubmitted: _searchPackages,
            ),
          ),
          if (_isLoading) const LinearProgressIndicator(),
          Expanded(
            child: ListView.builder(
              itemCount: _packages.length,
              itemBuilder: (context, index) {
                final pkg = _packages[index];
                final pkgName = pkg.split('/').first.split(' ').first;
                return ListTile(
                  title: Text(pkgName, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(pkg, maxLines: 2, overflow: TextOverflow.ellipsis),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.download, color: Colors.green),
                        onPressed: () => _managePackage(pkgName, 'install'),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),
                        onPressed: () => _managePackage(pkgName, 'uninstall'),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
