import 'package:flutter/material.dart';

/// BuyMe Design System - Central Flutter Theme & Tokens
/// Brand: Primary Red (#E4002B) + Accent Yellow (#FFC20E) + White Canvas (#FFFDFD)
class AppColors {
  // Brand Colors
  static const Color primaryRed = Color(0xFFE4002B);
  static const Color deepRed = Color(0xFFB80022);
  static const Color softRed = Color(0xFFFFE9EC);
  static const Color accentYellow = Color(0xFFFFC20E);
  static const Color softYellow = Color(0xFFFFF6D6);
  static const Color canvas = Color(0xFFFFFDFD);
  static const Color canvasWarm = Color(0xFFFFF9F9);

  // Text Colors (High Contrast WCAG AA)
  static const Color darkNavy = Color(0xFF1F2430);
  static const Color secondaryText = Color(0xFF6B7280);
  static const Color muted = Color(0xFF9CA3AF);
  static const Color subtle = Color(0xFFD1D5DB);
  static const Color white = Color(0xFFFFFFFF);

  // Glass Surfaces
  static const Color glassSurface = Color(0xAEFFFFFF); // 68% White
  static const Color glassSurfaceElevated = Color(0xD6FFFFFF); // 84% White
  static const Color glassBorder = Color(0xBFFFFFFF); // 75% White
  static const Color glassBorderRed = Color(0x59E4002B); // 35% Red

  // Aurora Blobs
  static const Color auroraBlob1 = Color(0x2EE4002B); // 18% primary red
  static const Color auroraBlob2 = Color(0x24FFC20E); // 14% accent yellow
  static const Color auroraBlob3 = Color(0x40FFE9EC); // soft red tint

  // Status Colors (Restrained dark red for error to distinguish from brand red)
  static const Color success = Color(0xFF10B981);
  static const Color successBg = Color(0xFFECFDF5);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningBg = Color(0xFFFFFBEB);
  static const Color error = Color(0xFF991B1B);
  static const Color errorBg = Color(0xFFFEF2F2);
  static const Color info = Color(0xFF2563EB);
  static const Color infoBg = Color(0xFFEFF6FF);

  // Aliases for compatibility
  static const Color primaryNeonBlue = primaryRed;
  static const Color iceWhite = canvas;
  static const Color softBlue = softRed;
  static const Color glassBorderNeon = glassBorderRed;

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryRed, deepRed],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient canvasGradient = LinearGradient(
    colors: [Color(0xFFFFFDFD), Color(0xFFFFE9EC), Color(0xFFFFF9F9)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}

class AppTypography {
  static const String headingFont = 'Manrope';
  static const String bodyFont = 'DM Sans';

  static const TextStyle displayLarge = TextStyle(
    fontFamily: headingFont,
    fontSize: 32,
    fontWeight: FontWeight.w800,
    color: AppColors.darkNavy,
    letterSpacing: -0.5,
  );

  static const TextStyle heading1 = TextStyle(
    fontFamily: headingFont,
    fontSize: 24,
    fontWeight: FontWeight.w700,
    color: AppColors.darkNavy,
    letterSpacing: -0.3,
  );

  static const TextStyle heading2 = TextStyle(
    fontFamily: headingFont,
    fontSize: 20,
    fontWeight: FontWeight.w700,
    color: AppColors.darkNavy,
  );

  static const TextStyle heading3 = TextStyle(
    fontFamily: headingFont,
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.darkNavy,
  );

  static const TextStyle bodyLarge = TextStyle(
    fontFamily: bodyFont,
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: AppColors.darkNavy,
    height: 1.5,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontFamily: bodyFont,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.secondaryText,
    height: 1.45,
  );

  static const TextStyle bodySmall = TextStyle(
    fontFamily: bodyFont,
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: AppColors.muted,
  );

  static const TextStyle priceText = TextStyle(
    fontFamily: headingFont,
    fontSize: 18,
    fontWeight: FontWeight.w800,
    color: AppColors.primaryRed,
  );

  static const TextStyle badgeText = TextStyle(
    fontFamily: headingFont,
    fontSize: 11,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.2,
  );
}

class AppRadius {
  static const double sm = 8.0;
  static const double md = 14.0;
  static const double lg = 20.0;
  static const double xl = 28.0;
  static const double full = 9999.0;
}
