import 'dart:io';
import 'dart:convert';

class TermuxService {
  static const String termuxPrefix = '/data/data/com.termux/files/usr/bin/';
  static const String termuxBin = '/data/data/com.termux/files/bin/';
  
  String? _lastOutput;
  String? _lastError;
  int? _lastExitCode;

  String? get lastOutput => _lastOutput;
  String? get lastError => _lastError;
  int? get lastExitCode => _lastExitCode;

  /// Execute a command in Termux
  Future<CommandResult> executeCommand(String command, {List<String>? args}) async {
    try {
      final fullCommand = args != null && args.isNotEmpty 
          ? '$command ${args.join(' ')}' 
          : command;
      
      final result = await Process.run(
        termuxPrefix + command,
        args ?? [],
        runInShell: true,
      );
      
      _lastOutput = result.stdout.toString();
      _lastError = result.stderr.toString();
      _lastExitCode = result.exitCode;
      
      return CommandResult(
        output: _lastOutput!,
        error: _lastError!,
        exitCode: _lastExitCode!,
      );
    } catch (e) {
      _lastError = e.toString();
      _lastExitCode = -1;
      return CommandResult(
        output: '',
        error: _lastError!,
        exitCode: -1,
      );
    }
  }

  /// Execute a bash command
  Future<CommandResult> executeBash(String script) async {
    try {
      final result = await Process.run(
        termuxPrefix + 'bash',
        ['-c', script],
        runInShell: true,
      );
      
      _lastOutput = result.stdout.toString();
      _lastError = result.stderr.toString();
      _lastExitCode = result.exitCode;
      
      return CommandResult(
        output: _lastOutput!,
        error: _lastError!,
        exitCode: _lastExitCode!,
      );
    } catch (e) {
      _lastError = e.toString();
      _lastExitCode = -1;
      return CommandResult(output: '', error: _lastError!, exitCode: -1);
    }
  }

  /// Start an interactive shell
  Future<Process> startShell() async {
    return await Process.start(
      termuxPrefix + 'bash',
      [],
      environment: {'TERM': 'xterm-256color'},
    );
  }

  /// Get list of installed packages
  Future<List<PackageInfo>> getInstalledPackages() async {
    final result = await executeCommand('pkg', ['list-installed']);
    if (result.exitCode != 0) {
      return [];
    }
    
    final packages = <PackageInfo>[];
    final lines = result.output.split('\n');
    
    for (final line in lines) {
      if (line.isEmpty || line.startsWith('LIST')) continue;
      
      final parts = line.split(',');
      if (parts.isNotEmpty) {
        final name = parts[0].trim();
        if (name.isNotEmpty) {
          packages.add(PackageInfo(
            name: name,
            version: parts.length > 1 ? parts[1].trim() : 'Unknown',
          ));
        }
      }
    }
    
    return packages;
  }

  /// Search for packages
  Future<List<PackageInfo>> searchPackages(String query) async {
    final result = await executeCommand('pkg', ['search', query]);
    if (result.exitCode != 0) {
      return [];
    }
    
    final packages = <PackageInfo>[];
    final lines = result.output.split('\n');
    
    for (final line in lines) {
      if (line.isEmpty || !line.contains(query)) continue;
      final parts = line.split(' ');
      if (parts.isNotEmpty) {
        packages.add(PackageInfo(
          name: parts[0].trim(),
          version: parts.length > 1 ? parts[1].trim() : '',
        ));
      }
    }
    
    return packages;
  }

  /// Install a package
  Future<CommandResult> installPackage(String packageName) async {
    return await executeCommand('pkg', ['install', '-y', packageName]);
  }

  /// Remove a package
  Future<CommandResult> removePackage(String packageName) async {
    return await executeCommand('pkg', ['uninstall', '-y', packageName]);
  }

  /// Update package list
  Future<CommandResult> updatePackageList() async {
    return await executeCommand('pkg', ['update']);
  }

  /// Upgrade packages
  Future<CommandResult> upgradePackages() async {
    return await executeCommand('pkg', ['upgrade', '-y']);
  }

  /// Get system information
  Future<SystemInfo> getSystemInfo() async {
    final unameResult = await executeBash('uname -a');
    final uptimeResult = await executeBash('uptime');
    final dfResult = await executeBash('df -h');
    final freeResult = await executeBash('free -m');
    
    return SystemInfo(
      kernel: unameResult.output.trim(),
      uptime: uptimeResult.output.trim(),
      diskUsage: dfResult.output.trim(),
      memory: freeResult.output.trim(),
    );
  }

  /// Get CPU usage
  Future<double> getCpuUsage() async {
    final result = await executeBash(
      "top -bn1 | grep 'Cpu(s)' | awk '{print \$2}' | cut -d'%' -f1",
    );
    return double.tryParse(result.output.trim()) ?? 0.0;
  }

  /// Get memory usage
  Future<MemoryInfo> getMemoryUsage() async {
    final result = await executeBash('free -m');
    final lines = result.output.split('\n');
    
    if (lines.length < 2) {
      return MemoryInfo(total: 0, used: 0, free: 0);
    }
    
    final memLine = lines[1].split(RegExp(r'\s+'));
    if (memLine.length < 3) {
      return MemoryInfo(total: 0, used: 0, free: 0);
    }
    
    final total = int.tryParse(memLine[1]) ?? 0;
    final used = int.tryParse(memLine[2]) ?? 0;
    final free = int.tryParse(memLine[3]) ?? 0;
    
    return MemoryInfo(total: total, used: used, free: free);
  }

  /// List files in directory
  Future<List<FileItem>> listFiles(String path) async {
    final result = await executeBash('ls -la "$path"');
    if (result.exitCode != 0) {
      return [];
    }
    
    final files = <FileItem>[];
    final lines = result.output.split('\n');
    
    for (final line in lines) {
      if (line.trim().isEmpty) continue;
      
      final parts = line.split(RegExp(r'\s+'));
      if (parts.length < 9) continue;
      
      final isDirectory = parts[0].startsWith('d');
      final name = parts.sublist(8).join(' ');
      if (name == '.' || name == '..') continue;
      
      files.add(FileItem(
        name: name,
        path: path.endsWith('/') ? '$path$name' : '$path/$name',
        isDirectory: isDirectory,
        size: isDirectory ? 0 : int.tryParse(parts[4]) ?? 0,
        permissions: parts[0],
        modified: parts.length > 5 ? '${parts[5]} ${parts[6]} ${parts[7]}' : '',
      ));
    }
    
    return files;
  }

  /// Read file content
  Future<String> readFile(String path) async {
    final result = await executeBash('cat "$path"');
    return result.output;
  }

  /// Write file content
  Future<bool> writeFile(String path, String content) async {
    // Use base64 to handle special characters
    final encoded = base64Encode(utf8.encode(content));
    final result = await executeBash('echo "$encoded" | base64 -d > "$path"');
    return result.exitCode == 0;
  }

  /// Delete file or directory
  Future<bool> deleteFile(String path, {bool recursive = false}) async {
    final flag = recursive ? '-rf' : '-f';
    final result = await executeBash('rm $flag "$path"');
    return result.exitCode == 0;
  }

  /// Create directory
  Future<bool> createDirectory(String path) async {
    final result = await executeBash('mkdir -p "$path"');
    return result.exitCode == 0;
  }

  /// Copy file
  Future<bool> copyFile(String source, String dest) async {
    final result = await executeBash('cp "$source" "$dest"');
    return result.exitCode == 0;
  }

  /// Move file
  Future<bool> moveFile(String source, String dest) async {
    final result = await executeBash('mv "$source" "$dest"');
    return result.exitCode == 0;
  }

  /// Get running processes
  Future<List<ProcessInfo>> getProcesses() async {
    final result = await executeBash('ps aux');
    if (result.exitCode != 0) return [];
    
    final processes = <ProcessInfo>[];
    final lines = result.output.split('\n');
    
    for (int i = 1; i < lines.length; i++) {
      final parts = lines[i].trim().split(RegExp(r'\s+'));
      if (parts.length < 11) continue;
      
      processes.add(ProcessInfo(
        pid: int.tryParse(parts[1]) ?? 0,
        user: parts[0],
        cpu: double.tryParse(parts[2]) ?? 0.0,
        mem: double.tryParse(parts[3]) ?? 0.0,
        command: parts.sublist(10).join(' '),
      ));
    }
    
    return processes;
  }
}

class CommandResult {
  final String output;
  final String error;
  final int exitCode;

  CommandResult({
    required this.output,
    required this.error,
    required this.exitCode,
  });

  bool get isSuccess => exitCode == 0;
}

class PackageInfo {
  final String name;
  final String version;

  PackageInfo({required this.name, required this.version});
}

class SystemInfo {
  final String kernel;
  final String uptime;
  final String diskUsage;
  final String memory;

  SystemInfo({
    required this.kernel,
    required this.uptime,
    required this.diskUsage,
    required this.memory,
  });
}

class MemoryInfo {
  final int total;
  final int used;
  final int free;

  MemoryInfo({required this.total, required this.used, required this.free});

  double get usedPercent => total > 0 ? (used / total) * 100 : 0;
}

class FileItem {
  final String name;
  final String path;
  final bool isDirectory;
  final int size;
  final String permissions;
  final String modified;

  FileItem({
    required this.name,
    required this.path,
    required this.isDirectory,
    required this.size,
    required this.permissions,
    required this.modified,
  });
}

class ProcessInfo {
  final int pid;
  final String user;
  final double cpu;
  final double mem;
  final String command;

  ProcessInfo({
    required this.pid,
    required this.user,
    required this.cpu,
    required this.mem,
    required this.command,
  });
}
