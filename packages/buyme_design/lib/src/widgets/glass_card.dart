import 'dart:ui';
import 'package:flutter/material.dart';
import '../tokens/app_colors.dart';
import '../tokens/app_radii.dart';
import '../tokens/app_shadows.dart';

/// BuyMe True Frosted Glass Card
/// Uses BackdropFilter with sigma 20 blur + 70% white fill + 1px 75% border + soft blue shadow.
class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final BorderRadius? borderRadius;
  final double blur;
  final Color? fillColor;
  final Color? borderColor;
  final List<BoxShadow>? boxShadow;
  final VoidCallback? onTap;
  final bool isElevated;
  final bool opaqueTextSurface;

  const GlassCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.borderRadius,
    this.blur = 20.0,
    this.fillColor,
    this.borderColor,
    this.boxShadow,
    this.onTap,
    this.isElevated = false,
    this.opaqueTextSurface = false,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveRadius = borderRadius ?? AppRadii.border2Xl;
    final effectiveFill = fillColor ?? (isElevated ? AppColors.glassFillElevated : AppColors.glassFill);
    final effectiveBorder = borderColor ?? AppColors.glassBorder;
    final effectiveShadow = boxShadow ?? (isElevated ? AppShadows.glassElevated : AppShadows.glass);

    Widget cardBody = child;
    if (opaqueTextSurface) {
      cardBody = Container(
        decoration: BoxDecoration(
          color: Colors.white.withAlpha(210), // 82% opaque white layer for body text contrast
          borderRadius: effectiveRadius,
        ),
        padding: padding ?? const EdgeInsets.all(16),
        child: child,
      );
    }

    Widget content = Container(
      margin: margin,
      decoration: BoxDecoration(
        borderRadius: effectiveRadius,
        boxShadow: effectiveShadow,
      ),
      child: ClipRRect(
        borderRadius: effectiveRadius,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Container(
            padding: opaqueTextSurface ? EdgeInsets.zero : (padding ?? const EdgeInsets.all(16)),
            decoration: BoxDecoration(
              color: effectiveFill,
              borderRadius: effectiveRadius,
              border: Border.all(color: effectiveBorder, width: 1.0),
            ),
            child: cardBody,
          ),
        ),
      ),
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: effectiveRadius,
        child: content,
      );
    }

    return content;
  }
}

