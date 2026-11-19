import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../tokens/app_colors.dart';
import '../tokens/app_radii.dart';
import '../tokens/app_shadows.dart';
import '../tokens/app_typography.dart';

/// BuyMe Category Card
/// Supports bilingual titles (English & Tamil), Lucide icon or network image,
/// item count badge, and animated press scale.
class CategoryCard extends StatefulWidget {
  final String id;
  final String title;
  final String? titleTa;
  final IconData? icon;
  final String? imageUrl;
  final int? itemCount;
  final bool isSelected;
  final VoidCallback? onTap;

  const CategoryCard({
    super.key,
    required this.id,
    required this.title,
    this.titleTa,
    this.icon,
    this.imageUrl,
    this.itemCount,
    this.isSelected = false,
    this.onTap,
  });

  @override
  State<CategoryCard> createState() => _CategoryCardState();
}

class _CategoryCardState extends State<CategoryCard> with SingleTickerProviderStateMixin {
  late AnimationController _pressController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _pressController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.96).animate(
      CurvedAnimation(parent: _pressController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _pressController.forward(),
      onTapUp: (_) {
        _pressController.reverse();
        widget.onTap?.call();
      },
      onTapCancel: () => _pressController.reverse(),
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) => Transform.scale(
          scale: _scaleAnimation.value,
          child: child,
        ),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: AppRadii.border2Xl,
            boxShadow: widget.isSelected ? AppShadows.neonGlow : AppShadows.card,
          ),
          child: ClipRRect(
            borderRadius: AppRadii.border2Xl,
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
                decoration: BoxDecoration(
                  color: widget.isSelected
                      ? AppColors.softBlue.withOpacity(0.92)
                      : AppColors.glassFill,
                  borderRadius: AppRadii.border2Xl,
                  border: Border.all(
                    color: widget.isSelected
                        ? AppColors.neonBlue
                        : AppColors.glassBorder,
                    width: widget.isSelected ? 1.5 : 1.0,
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Icon or Image Container
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: widget.isSelected
                            ? AppColors.neonBlue
                            : AppColors.softBlue,
                        borderRadius: AppRadii.borderLg,
                        boxShadow: widget.isSelected
                            ? [
                                BoxShadow(
                                  color: AppColors.neonBlue.withOpacity(0.35),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                )
                              ]
                            : null,
                      ),
                      child: Center(
                        child: widget.icon != null
                            ? Icon(
                                widget.icon,
                                color: widget.isSelected
                                    ? Colors.white
                                    : AppColors.neonBlue,
                                size: 24,
                              )
                            : (widget.imageUrl != null
                                ? Image.network(
                                    widget.imageUrl!,
                                    width: 32,
                                    height: 32,
                                    fit: BoxFit.contain,
                                    errorBuilder: (_, __, ___) => Icon(
                                      LucideIcons.package,
                                      color: widget.isSelected
                                          ? Colors.white
                                          : AppColors.neonBlue,
                                      size: 24,
                                    ),
                                  )
                                : Icon(
                                    LucideIcons.package,
                                    color: widget.isSelected
                                        ? Colors.white
                                        : AppColors.neonBlue,
                                    size: 24,
                                  )),
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Title
                    Text(
                      widget.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      textAlign: TextAlign.center,
                      style: AppTypography.h4.copyWith(
                        fontSize: 13,
                        color: widget.isSelected
                            ? AppColors.neonBlue
                            : AppColors.darkNavy,
                        fontWeight: FontWeight.w700,
                      ),
                    ),

                    // Tamil Title (Bilingual)
                    if (widget.titleTa != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        widget.titleTa!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                        style: AppTypography.tamilBody(
                          fontSize: 10,
                          color: AppColors.mutedText,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],

                    // Item Count Badge
                    if (widget.itemCount != null) ...[
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: widget.isSelected
                              ? AppColors.neonBlue.withOpacity(0.12)
                              : Colors.white,
                          borderRadius: AppRadii.borderFull,
                          border: Border.all(
                            color: widget.isSelected
                                ? AppColors.neonBlue.withOpacity(0.25)
                                : AppColors.borderCard,
                            width: 0.8,
                          ),
                        ),
                        child: Text(
                          "${widget.itemCount} items",
                          style: AppTypography.caption.copyWith(
                            fontSize: 9.5,
                            fontWeight: FontWeight.w700,
                            color: widget.isSelected
                                ? AppColors.neonBlue
                                : AppColors.secondaryText,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

