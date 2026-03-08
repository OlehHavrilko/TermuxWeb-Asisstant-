import 'dart:io';

class TermuxService {
  static final TermuxService _instance = TermuxService._internal();
  factory TermuxService() => _instance;
  TermuxService._internal();

  final String binPath = '/data/data/com.termux/files/usr/bin/';
  final String homePath = '/data/data/com.termux/files/home/';

  Future<String> runCommand(String command, {List<String> args = const []}) async {
    try {
      final result = await Process.run(
        '${binPath}bash',
        ['-c', '$command ${args.join(' ')}'],
      );
      if (result.exitCode != 0) {
        return result.stderr.toString();
      }
      return result.stdout.toString();
    } catch (e) {
      return 'Error: $e';
    }
  }

  Future<bool> isInstalled() async {
    return Directory(binPath).exists();
  }
}
