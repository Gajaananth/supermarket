import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

ThemeData buildAdminTheme() {
  final base = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primaryRed,
      primary: AppColors.primaryRed,
      secondary: AppColors.accentYellow,
      surface: AppColors.white,
      error: AppColors.error,
    ),
    scaffoldBackgroundColor: AppColors.canvas,
  );
  return base.copyWith(
    textTheme: GoogleFonts.dmSansTextTheme(
      base.textTheme,
    ).apply(bodyColor: AppColors.bodyText, displayColor: AppColors.darkNavy),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      foregroundColor: AppColors.darkNavy,
      elevation: 0,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.glassFillOpaque,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: AppColors.borderMedium),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: AppColors.borderMedium),
      ),
    ),
  );
}
