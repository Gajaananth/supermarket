import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../tokens/app_colors.dart';
import '../tokens/app_radii.dart';
import '../tokens/app_shadows.dart';
import '../tokens/app_typography.dart';

enum ToastType { info, success, warning, error }

/// BuyMe Glass Toast Notification
class BuyMeToast extends StatelessWidget {
  final String message;
  final String? subtitle;
  final ToastType type;
  final VoidCallback? onDismiss;

  const BuyMeToast({
    super.key,
    required this.message,
    this.subtitle,
    this.type = ToastType.info,
    this.onDismiss,
  });

  /// Static helper to trigger a BuyMe floating glass toast
  static void show(
    BuildContext context, {
    required String message,
    String? subtitle,
    ToastType type = ToastType.info,
    Duration duration = const Duration(seconds: 3),
  }) {
    final overlay = Overlay.of(context);
    late OverlayEntry entry;

    entry = OverlayEntry(
      builder: (context) => Positioned(
        top: MediaQuery.of(context).padding.top + 16,
        left: 20,
        right: 20,
        child: Material(
          color: Colors.transparent,
          child: TweenAnimationBuilder<double>(
            tween: Tween(begin: 0.0, end: 1.0),
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeOutBack,
            builder: (context, value, child) {
              return Transform.translate(
                offset: Offset(0, (1 - value) * -20),
                child: Opacity(
                  opacity: value.clamp(0.0, 1.0),
                  child: child,
                ),
              );
            },
            child: BuyMeToast(
              message: message,
              subtitle: subtitle,
              type: type,
              onDismiss: () => entry.remove(),
            ),
          ),
        ),
      ),
    );

    overlay.insert(entry);
    Future.delayed(duration, () {
      if (entry.mounted) {
        entry.remove();
      }
    });
  }

  Color _getColor() {
    switch (type) {
      case ToastType.success:
        return AppColors.success;
      case ToastType.warning:
        return AppColors.warning;
      case ToastType.error:
        return AppColors.error;
      case ToastType.info:
        return AppColors.neonBlue;
    }
  }

  IconData _getIcon() {
    switch (type) {
      case ToastType.success:
        return LucideIcons.checkCircle;
      case ToastType.warning:
        return LucideIcons.alertTriangle;
      case ToastType.error:
        return LucideIcons.alertCircle;
      case ToastType.info:
        return LucideIcons.info;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _getColor();
    final icon = _getIcon();

    return Container(
      decoration: const BoxDecoration(
        borderRadius: AppRadii.borderXl,
        boxShadow: AppShadows.floatingNav,
      ),
      child: ClipRRect(
        borderRadius: AppRadii.borderXl,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.92),
              borderRadius: AppRadii.borderXl,
              border: Border.all(
                color: color.withOpacity(0.4),
                width: 1.2,
              ),
            ),
            child: Row(
              children: [
                // Icon
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, size: 20, color: color),
                ),
                const SizedBox(width: 12),

                // Text
                Expanded(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        message,
                        style: AppTypography.bodyMedium.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.darkNavy,
                        ),
                      ),
                      if (subtitle != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          subtitle!,
                          style: AppTypography.caption.copyWith(
                            color: AppColors.secondaryText,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),

                // Close Button
                if (onDismiss != null)
                  GestureDetector(
                    onTap: onDismiss,
                    child: Padding(
                      padding: const EdgeInsets.all(4.0),
                      child: Icon(
                        LucideIcons.x,
                        size: 16,
                        color: AppColors.mutedText,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
