import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/services/termux_service.dart';

class MonitorPage extends StatefulWidget {
  const MonitorPage({super.key});

  @override
  State<MonitorPage> createState() => _MonitorPageState();
}

class _MonitorPageState extends State<MonitorPage> {
  Timer? _refreshTimer;
  SystemInfo? _systemInfo;
  MemoryInfo? _memoryInfo;
  double _cpuUsage = 0;
  bool _isLoading = true;
  
  final List<double> _cpuHistory = [];
  final List<double> _memoryHistory = [];
  static const int _maxHistoryPoints = 30;

  @override
  void initState() {
    super.initState();
    _loadSystemInfo();
    _refreshTimer = Timer.periodic(const Duration(seconds: 2), (_) => _loadSystemInfo());
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadSystemInfo() async {
    try {
      final termuxService = context.read<TermuxService>();
      
      final cpuFuture = termuxService.getCpuUsage();
      final memFuture = termuxService.getMemoryUsage();
      final sysFuture = termuxService.getSystemInfo();
      
      final results = await Future.wait([cpuFuture, memFuture, sysFuture]);
      
      final cpu = results[0] as double;
      final mem = results[1] as MemoryInfo;
      final sys = results[2] as SystemInfo;
      
      setState(() {
        _cpuUsage = cpu;
        _memoryInfo = mem;
        _systemInfo = sys;
        _isLoading = false;
        
        _cpuHistory.add(cpu);
        _memoryHistory.add(mem.usedPercent);
        
        if (_cpuHistory.length > _maxHistoryPoints) {
          _cpuHistory.removeAt(0);
          _memoryHistory.removeAt(0);
        }
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('System Monitor'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadSystemInfo,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadSystemInfo,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // CPU Usage Card
                    _buildStatCard(
                      title: 'CPU Usage',
                      value: '${_cpuUsage.toStringAsFixed(1)}%',
                      icon: Icons.memory,
                      color: Colors.blue,
                      chart: _buildCpuChart(),
                    ),
                    const SizedBox(height: 16),
                    
                    // Memory Usage Card
                    _buildStatCard(
                      title: 'Memory Usage',
                      value: _memoryInfo != null
                          ? '${_memoryInfo!.used} MB / ${_memoryInfo!.total} MB'
                          : 'Loading...',
                      icon: Icons.storage,
                      color: Colors.purple,
                      chart: _buildMemoryChart(),
                    ),
                    const SizedBox(height: 16),
                    
                    // System Info Card
                    _buildInfoCard(),
                    const SizedBox(height: 16),
                    
                    // Storage Card
                    _buildStorageCard(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    Widget? chart,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            if (chart != null) ...[
              const SizedBox(height: 16),
              SizedBox(
                height: 100,
                child: chart,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildCpuChart() {
    if (_cpuHistory.isEmpty) return const SizedBox();
    
    return LineChart(
      LineChartData(
        gridData: const FlGridData(show: false),
        titlesData: const FlTitlesData(show: false),
        borderData: FlBorderData(show: false),
        lineBarsData: [
          LineChartBarData(
            spots: _cpuHistory.asMap().entries.map((e) {
              return FlSpot(e.key.toDouble(), e.value);
            }).toList(),
            isCurved: true,
            color: Colors.blue,
            barWidth: 2,
            isStrokeCapRound: true,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              color: Colors.blue.withOpacity(0.1),
            ),
          ),
        ],
        minY: 0,
        maxY: 100,
      ),
    );
  }

  Widget _buildMemoryChart() {
    if (_memoryHistory.isEmpty) return const SizedBox();
    
    return LineChart(
      LineChartData(
        gridData: const FlGridData(show: false),
        titlesData: const FlTitlesData(show: false),
        borderData: FlBorderData(show: false),
        lineBarsData: [
          LineChartBarData(
            spots: _memoryHistory.asMap().entries.map((e) {
              return FlSpot(e.key.toDouble(), e.value);
            }).toList(),
            isCurved: true,
            color: Colors.purple,
            barWidth: 2,
            isStrokeCapRound: true,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              color: Colors.purple.withOpacity(0.1),
            ),
          ),
        ],
        minY: 0,
        maxY: 100,
      ),
    );
  }

  Widget _buildInfoCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.info_outline),
                const SizedBox(width: 8),
                Text(
                  'System Information',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (_systemInfo != null) ...[
              _buildInfoRow('Kernel', _systemInfo!.kernel),
              const Divider(),
              _buildInfoRow('Uptime', _systemInfo!.uptime),
            ] else
              const Text('Loading...'),
          ],
        ),
      ),
    );
  }

  Widget _buildStorageCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.folder),
                const SizedBox(width: 8),
                Text(
                  'Storage',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildStorageBar('Root', 45, 100),
            const SizedBox(height: 8),
            _buildStorageBar('Data', 30, 100),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
            child: SelectableText(
              value,
              style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStorageBar(String label, int used, int total) {
    final percent = (used / total) * 100;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label),
            Text('$used GB / $total GB'),
          ],
        ),
        const SizedBox(height: 4),
        LinearProgressIndicator(
          value: percent / 100,
          backgroundColor: Colors.grey.withOpacity(0.2),
          valueColor: AlwaysStoppedAnimation<Color>(
            percent > 90 ? Colors.red : percent > 70 ? Colors.orange : Colors.green,
          ),
        ),
      ],
    );
  }
}
