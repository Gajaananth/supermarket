import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// BuyMe Typography System
/// Manrope for headings & numbers, DM Sans for body, Noto Sans Tamil for Tamil script.
class AppTypography {
  // Headings (Manrope)
  static TextStyle h1 = GoogleFonts.manrope(
    fontSize: 28,
    fontWeight: FontWeight.w800,
    color: AppColors.darkNavy,
    letterSpacing: -0.5,
  );

  static TextStyle h2 = GoogleFonts.manrope(
    fontSize: 22,
    fontWeight: FontWeight.w800,
    color: AppColors.darkNavy,
    letterSpacing: -0.3,
  );

  static TextStyle h3 = GoogleFonts.manrope(
    fontSize: 18,
    fontWeight: FontWeight.w700,
    color: AppColors.darkNavy,
    letterSpacing: -0.2,
  );

  static TextStyle h4 = GoogleFonts.manrope(
    fontSize: 15,
    fontWeight: FontWeight.w700,
    color: AppColors.darkNavy,
  );

  // Prices & Numerical metrics (Manrope)
  static TextStyle priceLarge = GoogleFonts.manrope(
    fontSize: 24,
    fontWeight: FontWeight.w800,
    color: AppColors.neonBlue,
  );

  static TextStyle priceMedium = GoogleFonts.manrope(
    fontSize: 16,
    fontWeight: FontWeight.w800,
    color: AppColors.neonBlue,
  );

  static TextStyle priceSmall = GoogleFonts.manrope(
    fontSize: 13,
    fontWeight: FontWeight.w700,
    color: AppColors.neonBlue,
  );

  // Body Text (DM Sans)
  static TextStyle bodyLarge = GoogleFonts.dmSans(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    color: AppColors.bodyText,
    height: 1.5,
  );

  static TextStyle bodyMedium = GoogleFonts.dmSans(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.bodyText,
    height: 1.4,
  );

  static TextStyle bodySmall = GoogleFonts.dmSans(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: AppColors.secondaryText,
    height: 1.3,
  );

  // Labels & Captions
  static TextStyle label = GoogleFonts.manrope(
    fontSize: 11,
    fontWeight: FontWeight.w800,
    color: AppColors.mutedText,
    letterSpacing: 0.8,
  );

  static TextStyle caption = GoogleFonts.dmSans(
    fontSize: 10,
    fontWeight: FontWeight.w500,
    color: AppColors.mutedText,
  );

  // Tamil Text Stylers (Noto Sans Tamil)
  static TextStyle tamilTitle({double fontSize = 16, FontWeight fontWeight = FontWeight.w700, Color color = AppColors.darkNavy}) {
    return GoogleFonts.notoSansTamil(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: 1.3,
    );
  }

  static TextStyle tamilBody({double fontSize = 13, FontWeight fontWeight = FontWeight.w500, Color color = AppColors.bodyText}) {
    return GoogleFonts.notoSansTamil(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: 1.4,
    );
  }
}

