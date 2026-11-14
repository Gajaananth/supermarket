import 'dart:ui';
import 'package:flutter/material.dart';
import '../tokens/app_colors.dart';
import '../tokens/app_radii.dart';
import '../tokens/app_shadows.dart';

class GlassNavItem {
  final IconData icon;
  final String label;
  final Widget? badge;

  const GlassNavItem({
    required this.icon,
    required this.label,
    this.badge,
  });
}

/// BuyMe Floating Glass Navigation Bar
/// Floating rounded pill with sigma 24 blur, 1px frosted border, and neon blue active highlights.
class GlassBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final List<GlassNavItem> items;

  const GlassBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: const BoxDecoration(
          borderRadius: AppRadii.borderFull,
          boxShadow: AppShadows.floatingNav,
        ),
        child: ClipRRect(
          borderRadius: AppRadii.borderFull,
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
            child: Container(
              height: 64,
              padding: const EdgeInsets.symmetric(horizontal: 10),
              decoration: BoxDecoration(
                color: AppColors.glassFillElevated,
                borderRadius: AppRadii.borderFull,
                border: Border.all(color: AppColors.glassBorder, width: 1.0),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: List.generate(items.length, (index) {
                  final item = items[index];
                  final isSelected = index == currentIndex;

                  return GestureDetector(
                    onTap: () => onTap(index),
                    behavior: HitTestBehavior.opaque,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 220),
                      curve: Curves.easeOutCubic,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.softBlue : Colors.transparent,
                        borderRadius: AppRadii.borderFull,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Stack(
                            clipBehavior: Clip.none,
                            children: [
                              Icon(
                                item.icon,
                                size: 20,
                                color: isSelected ? AppColors.neonBlue : AppColors.mutedText,
                              ),
                              if (item.badge != null)
                                Positioned(
                                  top: -6,
                                  right: -8,
                                  child: item.badge!,
                                ),
                            ],
                          ),
                          if (isSelected) ...[
                            const SizedBox(width: 8),
                            Text(
                              item.label,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: AppColors.neonBlue,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

