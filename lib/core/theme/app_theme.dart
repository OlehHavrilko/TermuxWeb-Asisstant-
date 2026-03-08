import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData.dark().copyWith(
      scaffoldBackgroundColor: const Color(0xFF121212),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF1E1E1E),
        elevation: 0,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Color(0xFF1E1E1E),
        selectedItemColor: Colors.greenAccent,
        unselectedItemColor: Colors.grey,
      ),
      textTheme: const TextTheme(
        bodyMedium: TextStyle(fontFamily: 'monospace', color: Colors.greenAccent),
        bodyLarge: TextStyle(fontFamily: 'monospace', color: Colors.greenAccent),
        bodySmall: TextStyle(fontFamily: 'monospace', color: Colors.greenAccent),
      ),
    );
  }

  static ThemeData get lightTheme {
    return ThemeData.light().copyWith(
      scaffoldBackgroundColor: Colors.white,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.blueGrey,
        elevation: 0,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: Colors.blue,
        unselectedItemColor: Colors.grey,
      ),
      textTheme: const TextTheme(
        bodyMedium: TextStyle(fontFamily: 'monospace', color: Colors.black87),
        bodyLarge: TextStyle(fontFamily: 'monospace', color: Colors.black87),
        bodySmall: TextStyle(fontFamily: 'monospace', color: Colors.black87),
      ),
    );
  }
}
