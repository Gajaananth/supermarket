import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../tokens/app_colors.dart';
import '../tokens/app_radii.dart';
import '../tokens/app_shadows.dart';

/// BuyMe Translucent Glass Search Bar with Lucide Icons
class SearchBarWidget extends StatelessWidget {
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onClear;
  final VoidCallback? onFilterTap;
  final String hintText;
  final bool hasFilterBadge;
  final bool autofocus;

  const SearchBarWidget({
    super.key,
    this.controller,
    this.onChanged,
    this.onSubmitted,
    this.onClear,
    this.onFilterTap,
    this.hintText = "Search fresh groceries in Batticaloa...",
    this.hasFilterBadge = false,
    this.autofocus = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        borderRadius: AppRadii.borderFull,
        boxShadow: AppShadows.card,
      ),
      child: ClipRRect(
        borderRadius: AppRadii.borderFull,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
          child: Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: AppColors.glassFillElevated,
              borderRadius: AppRadii.borderFull,
              border: Border.all(color: AppColors.glassBorder, width: 1.0),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.search, color: AppColors.neonBlue, size: 18),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: controller,
                    onChanged: onChanged,
                    onSubmitted: onSubmitted,
                    autofocus: autofocus,
                    style: const TextStyle(
                      color: AppColors.darkNavy,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                    decoration: InputDecoration(
                      hintText: hintText,
                      hintStyle: const TextStyle(
                        color: AppColors.mutedText,
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                ),
                if (controller != null && controller!.text.isNotEmpty)
                  GestureDetector(
                    onTap: () {
                      controller?.clear();
                      onClear?.call();
                    },
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 4),
                      child: Icon(LucideIcons.x, color: AppColors.mutedText, size: 16),
                    ),
                  ),
                if (onFilterTap != null) ...[
                  Container(
                    height: 22,
                    width: 1,
                    margin: const EdgeInsets.symmetric(horizontal: 8),
                    color: AppColors.borderCard,
                  ),
                  GestureDetector(
                    onTap: onFilterTap,
                    child: Stack(
                      clipBehavior: Clip.none,
                      children: [
                        const Icon(LucideIcons.slidersHorizontal, color: AppColors.darkNavy, size: 18),
                        if (hasFilterBadge)
                          Positioned(
                            top: -2,
                            right: -2,
                            child: Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: AppColors.neonBlue,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

