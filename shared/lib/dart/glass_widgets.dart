import 'dart:ui';
import 'package:flutter/material.dart';
import 'theme.dart';

/// Reusable Glassmorphism Card for Flutter Mobile Applications
class GlassCard extends StatelessWidget {
  final Widget child;
  final double blur;
  final double borderRadius;
  final Color? surfaceColor;
  final Color? borderColor;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final VoidCallback? onTap;

  const GlassCard({
    super.key,
    required this.child,
    this.blur = 16.0,
    this.borderRadius = AppRadius.lg,
    this.surfaceColor,
    this.borderColor,
    this.padding = const EdgeInsets.all(16.0),
    this.margin,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Widget cardContent = ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: surfaceColor ?? AppColors.glassSurface,
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(
              color: borderColor ?? AppColors.glassBorder,
              width: 1.2,
            ),
            boxShadow: const [
              BoxShadow(
                color: Color(0x1010243B),
                blurRadius: 24,
                offset: Offset(0, 8),
              ),
            ],
          ),
          child: child,
        ),
      ),
    );

    if (onTap != null) {
      return Container(
        margin: margin,
        child: InkWell(
          borderRadius: BorderRadius.circular(borderRadius),
          onTap: onTap,
          child: cardContent,
        ),
      );
    }

    if (margin != null) {
      return Container(margin: margin, child: cardContent);
    }

    return cardContent;
  }
}

/// Primary Neon Blue Action Button
class PrimaryNeonButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final IconData? icon;
  final bool isFullWidth;
  final bool isLoading;

  const PrimaryNeonButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.icon,
    this.isFullWidth = false,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    Widget content = Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(AppRadius.full),
        boxShadow: const [
          BoxShadow(
            color: Color(0x55168BFF),
            blurRadius: 18,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Center(
        child: isLoading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2.2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : Row(
                mainAxisSize: isFullWidth ? MainAxisSize.max : MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (icon != null) ...[
                    Icon(icon, color: Colors.white, size: 18),
                    const SizedBox(width: 8),
                  ],
                  Text(
                    text,
                    style: const TextStyle(
                      fontFamily: AppTypography.headingFont,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
      ),
    );

    return InkWell(
      borderRadius: BorderRadius.circular(AppRadius.full),
      onTap: isLoading ? null : onPressed,
      child: isFullWidth ? content : IntrinsicWidth(child: content),
    );
  }
}

/// Status Badge Component (Success, Warning, Info, Error)
class StatusBadge extends StatelessWidget {
  final String label;
  final Color textColor;
  final Color backgroundColor;
  final Color borderColor;

  const StatusBadge({
    super.key,
    required this.label,
    required this.textColor,
    required this.backgroundColor,
    required this.borderColor,
  });

  factory StatusBadge.success(String text) {
    return StatusBadge(
      label: text,
      textColor: AppColors.success,
      backgroundColor: AppColors.successBg,
      borderColor: const Color(0x4D10B981),
    );
  }

  factory StatusBadge.warning(String text) {
    return StatusBadge(
      label: text,
      textColor: AppColors.warning,
      backgroundColor: AppColors.warningBg,
      borderColor: const Color(0x4DF59E0B),
    );
  }

  factory StatusBadge.error(String text) {
    return StatusBadge(
      label: text,
      textColor: AppColors.error,
      backgroundColor: AppColors.errorBg,
      borderColor: const Color(0x4DEF4444),
    );
  }

  factory StatusBadge.brand(String text) {
    return StatusBadge(
      label: text,
      textColor: AppColors.primaryNeonBlue,
      backgroundColor: AppColors.softBlue,
      borderColor: const Color(0x4D168BFF),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(AppRadius.full),
        border: Border.all(color: borderColor, width: 1.0),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontFamily: AppTypography.headingFont,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: textColor,
        ),
      ),
    );
  }
}

