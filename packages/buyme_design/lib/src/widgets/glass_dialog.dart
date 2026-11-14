import 'dart:ui';
import 'package:flutter/material.dart';
import '../tokens/app_colors.dart';
import '../tokens/app_radii.dart';
import '../tokens/app_shadows.dart';

/// BuyMe Frosted Glass Dialog
class GlassDialog extends StatelessWidget {
  final Widget child;
  final double blur;
  final EdgeInsetsGeometry padding;

  const GlassDialog({
    super.key,
    required this.child,
    this.blur = 24.0,
    this.padding = const EdgeInsets.all(24),
  });

  static Future<T?> show<T>({
    required BuildContext context,
    required WidgetBuilder builder,
    bool barrierDismissible = true,
  }) {
    return showDialog<T>(
      context: context,
      barrierDismissible: barrierDismissible,
      barrierColor: Colors.black.withAlpha(60),
      builder: (ctx) => GlassDialog(child: builder(ctx)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      elevation: 0,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: Container(
        decoration: const BoxDecoration(
          borderRadius: AppRadii.border3Xl,
          boxShadow: AppShadows.glassElevated,
        ),
        child: ClipRRect(
          borderRadius: AppRadii.border3Xl,
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
            child: Container(
              padding: padding,
              decoration: BoxDecoration(
                color: AppColors.glassFillElevated,
                borderRadius: AppRadii.border3Xl,
                border: Border.all(color: AppColors.glassBorder, width: 1.0),
              ),
              child: child,
            ),
          ),
        ),
      ),
    );
  }
}

