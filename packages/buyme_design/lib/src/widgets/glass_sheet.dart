import 'dart:ui';
import 'package:flutter/material.dart';
import '../tokens/app_colors.dart';
import '../tokens/app_radii.dart';
import '../tokens/app_shadows.dart';

/// BuyMe Frosted Glass Bottom Sheet Container
class GlassSheet extends StatelessWidget {
  final Widget child;
  final double blur;
  final EdgeInsetsGeometry padding;

  const GlassSheet({
    super.key,
    required this.child,
    this.blur = 24.0,
    this.padding = const EdgeInsets.all(20),
  });

  static Future<T?> show<T>({
    required BuildContext context,
    required WidgetBuilder builder,
    bool isDismissible = true,
    bool enableDrag = true,
  }) {
    return showModalBottomSheet<T>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      elevation: 0,
      isDismissible: isDismissible,
      enableDrag: enableDrag,
      builder: (ctx) => GlassSheet(child: builder(ctx)),
    );
  }

  @override
  Widget build(BuildContext context) {
    const topRadius = BorderRadius.vertical(top: Radius.circular(28));

    return Container(
      decoration: const BoxDecoration(
        borderRadius: topRadius,
        boxShadow: AppShadows.glassElevated,
      ),
      child: ClipRRect(
        borderRadius: topRadius,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              color: AppColors.glassFillElevated,
              borderRadius: topRadius,
              border: const Border(
                top: BorderSide(color: AppColors.glassBorder, width: 1.0),
                left: BorderSide(color: AppColors.glassBorder, width: 1.0),
                right: BorderSide(color: AppColors.glassBorder, width: 1.0),
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Top drag pill
                Center(
                  child: Container(
                    width: 44,
                    height: 5,
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: AppColors.mutedText.withAlpha(80),
                      borderRadius: AppRadii.borderFull,
                    ),
                  ),
                ),
                child,
              ],
            ),
          ),
        ),
      ),
    );
  }
}

