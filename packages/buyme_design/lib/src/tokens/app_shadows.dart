import 'package:flutter/material.dart';

/// BuyMe Shadow & Glow Tokens
class AppShadows {
  static const List<BoxShadow> card = [
    BoxShadow(
      color: Color(0x1010243B),
      blurRadius: 16,
      offset: Offset(0, 4),
    ),
  ];

  static const List<BoxShadow> glass = [
    BoxShadow(
      color: Color(0x1F168BFF),
      blurRadius: 32,
      offset: Offset(0, 8),
    ),
  ];

  static const List<BoxShadow> glassElevated = [
    BoxShadow(
      color: Color(0x2410243B),
      blurRadius: 48,
      offset: Offset(0, 16),
    ),
  ];

  static const List<BoxShadow> neonGlow = [
    BoxShadow(
      color: Color(0x59168BFF),
      blurRadius: 20,
      offset: Offset(0, 4),
    ),
  ];

  static const List<BoxShadow> floatingNav = [
    BoxShadow(
      color: Color(0x2410243B),
      blurRadius: 36,
      offset: Offset(0, 12),
    ),
  ];
}

