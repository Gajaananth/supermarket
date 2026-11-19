import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../tokens/app_colors.dart';
import '../tokens/app_typography.dart';

/// BuyMe Translucent Glass App Bar
/// Implements real BackdropFilter blur with subtle border and Lucide back icon.
class GlassAppBar extends StatelessWidget implements PreferredSizeWidget {
  final Widget? title;
  final String? titleText;
  final Widget? leading;
  final List<Widget>? actions;
  final bool showBackButton;
  final VoidCallback? onBack;
  final double height;
  final double blur;

  const GlassAppBar({
    super.key,
    this.title,
    this.titleText,
    this.leading,
    this.actions,
    this.showBackButton = true,
    this.onBack,
    this.height = kToolbarHeight,
    this.blur = 24.0,
  });

  @override
  Size get preferredSize => Size.fromHeight(height);

  @override
  Widget build(BuildContext context) {
    Widget? leadingWidget = leading;
    if (leadingWidget == null && showBackButton && Navigator.of(context).canPop()) {
      leadingWidget = IconButton(
        icon: const Icon(LucideIcons.arrowLeft, color: AppColors.darkNavy, size: 20),
        onPressed: onBack ?? () => Navigator.of(context).maybePop(),
      );
    }

    Widget titleWidget = title ?? (titleText != null
        ? Text(titleText!, style: AppTypography.h3)
        : const SizedBox.shrink());

    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          height: preferredSize.height + MediaQuery.of(context).padding.top,
          padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top),
          decoration: const BoxDecoration(
            color: AppColors.glassFillElevated,
            border: Border(
              bottom: BorderSide(color: AppColors.glassBorder, width: 1.0),
            ),
            boxShadow: [
              BoxShadow(
                color: Color(0x0A10243B),
                blurRadius: 12,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: NavigationToolbar(
            leading: leadingWidget,
            middle: titleWidget,
            trailing: actions != null
                ? Row(
                    mainAxisSize: MainAxisSize.min,
                    children: actions!,
                  )
                : null,
            centerMiddle: true,
          ),
        ),
      ),
    );
  }
}

