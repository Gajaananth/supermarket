import 'package:flutter/material.dart';

/// BuyMe Brand Color Tokens
/// Single source of truth synchronized with tokens.json
/// Red + White + Yellow Glassmorphism
class AppColors {
  // Brand Core
  static const Color primaryRed = Color(0xFFE4002B);
  static const Color deepRed = Color(0xFFB80022);
  static const Color softRed = Color(0xFFFFE9EC);
  static const Color accentYellow = Color(0xFFFFC20E);
  static const Color softYellow = Color(0xFFFFF6D6);

  // Backgrounds & Neutrals
  static const Color white = Color(0xFFFFFFFF);
  static const Color warmOffWhite = Color(0xFFFFF9F9);
  static const Color canvas = Color(0xFFFFFDFD);
  static const Color iceWhite = Color(0xFFFFFDFD);
  static const Color softBlue = Color(0xFFFFE9EC); // soft red tint fallback

  // Typography (WCAG AA Compliant High Contrast)
  static const Color textNavy = Color(0xFF1F2430);
  static const Color darkNavy = Color(0xFF1F2430);
  static const Color darkNavyMuted = Color(0xFF374151);
  static const Color bodyText = Color(0xFF1F2430);
  static const Color secondaryText = Color(0xFF6B7280);
  static const Color mutedText = Color(0xFF9CA3AF);
  static const Color subtleText = Color(0xFFD1D5DB);

  // Borders
  static const Color borderLight = Color(0xFFF3F4F6);
  static const Color borderMedium = Color(0xFFE5E7EB);
  static const Color borderCard = Color(0xCCE5E7EB);
  static const Color borderRed = Color(0x40E4002B);
  static const Color borderYellow = Color(0x66FFC20E);
  static const Color borderNeon = Color(0x40E4002B); // alias to brand red

  // Glass Surfaces
  static const Color glassFill = Color(0xAEFFFFFF); // 68% white
  static const Color glassFillElevated = Color(0xD6FFFFFF); // 84% white
  static const Color glassFillOpaque = Color(0xF2FFFFFF); // 95% white
  static const Color glassBorder = Color(0xBFFFFFFF); // 75% white
  static const Color cardOpaqueFill = Colors.white;

  // Aurora Ambient Blobs (Red + Yellow + Soft Tint)
  static const Color auroraBlob1 = Color(0x2EE4002B); // 18% primary red
  static const Color auroraBlob2 = Color(0x24FFC20E); // 14% accent yellow
  static const Color auroraBlob3 = Color(0x40FFE9EC); // soft red tint

  // System Feedback
  static const Color success = Color(0xFF10B981);
  static const Color successLight = Color(0xFFECFDF5);
  static const Color successBorder = Color(0xFFA7F3D0);

  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFFFBEB);
  static const Color warningBorder = Color(0xFFFDE68A);

  // Restrained dark red for errors, distinct from brand primary red
  static const Color error = Color(0xFF991B1B);
  static const Color errorLight = Color(0xFFFEF2F2);
  static const Color errorBorder = Color(0xFFFECACA);

  static const Color info = Color(0xFF2563EB);
  static const Color infoLight = Color(0xFFEFF6FF);
  static const Color infoBorder = Color(0xFFBFDBFE);

  // Backward-compatibility aliases for smooth transition
  static const Color neonBlue = primaryRed;
  static const Color deepBlue = deepRed;
}
