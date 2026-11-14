import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../tokens/app_colors.dart';
import '../tokens/app_typography.dart';
import 'primary_button.dart';

/// BuyMe Empty State Widget for empty cart, no search results, no orders, etc.
class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final String? titleTa;
  final String? actionLabel;
  final VoidCallback? onAction;

  const EmptyState({
    super.key,
    this.icon = LucideIcons.shoppingBag,
    required this.title,
    required this.description,
    this.titleTa,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Frosted Icon Container with subtle glow
            Container(
              width: 88,
              height: 88,
              decoration: BoxDecoration(
                color: AppColors.softBlue,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.glassBorder, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.neonBlue.withOpacity(0.12),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Center(
                child: Icon(
                  icon,
                  size: 40,
                  color: AppColors.neonBlue,
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Title
            Text(
              title,
              textAlign: TextAlign.center,
              style: AppTypography.h3.copyWith(
                fontSize: 19,
                fontWeight: FontWeight.w800,
                color: AppColors.darkNavy,
              ),
            ),

            // Tamil Title (Bilingual)
            if (titleTa != null) ...[
              const SizedBox(height: 4),
              Text(
                titleTa!,
                textAlign: TextAlign.center,
                style: AppTypography.tamilTitle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.mutedText,
                ),
              ),
            ],

            const SizedBox(height: 8),

            // Description
            Text(
              description,
              textAlign: TextAlign.center,
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.secondaryText,
                height: 1.45,
              ),
            ),

            // Action Button
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 24),
              PrimaryButton(
                text: actionLabel!,
                onPressed: onAction,
                icon: const Icon(LucideIcons.arrowRight, size: 18, color: Colors.white),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
