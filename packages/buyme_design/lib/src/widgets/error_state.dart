import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../tokens/app_colors.dart';
import '../tokens/app_typography.dart';
import 'primary_button.dart';
import 'secondary_button.dart';

/// BuyMe Error State Widget for network errors, failed operations, or missing data
class ErrorState extends StatelessWidget {
  final String title;
  final String message;
  final String? titleTa;
  final VoidCallback? onRetry;
  final String retryLabel;
  final VoidCallback? onSecondaryAction;
  final String? secondaryActionLabel;
  final IconData icon;

  const ErrorState({
    super.key,
    this.title = "Something went wrong",
    required this.message,
    this.titleTa,
    this.onRetry,
    this.retryLabel = "Try Again",
    this.onSecondaryAction,
    this.secondaryActionLabel,
    this.icon = LucideIcons.alertTriangle,
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
            // Error Icon Container
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.errorLight,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.errorBorder, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.error.withOpacity(0.12),
                    blurRadius: 20,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Center(
                child: Icon(
                  icon,
                  size: 36,
                  color: AppColors.error,
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Title
            Text(
              title,
              textAlign: TextAlign.center,
              style: AppTypography.h3.copyWith(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.darkNavy,
              ),
            ),

            if (titleTa != null) ...[
              const SizedBox(height: 4),
              Text(
                titleTa!,
                textAlign: TextAlign.center,
                style: AppTypography.tamilTitle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: AppColors.mutedText,
                ),
              ),
            ],

            const SizedBox(height: 8),

            // Description
            Text(
              message,
              textAlign: TextAlign.center,
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.secondaryText,
                height: 1.45,
              ),
            ),

            // Action Buttons
            if (onRetry != null || onSecondaryAction != null) ...[
              const SizedBox(height: 24),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (onRetry != null)
                    PrimaryButton(
                      text: retryLabel,
                      onPressed: onRetry,
                      icon: const Icon(LucideIcons.refreshCw, size: 18, color: Colors.white),
                    ),
                  if (onRetry != null && onSecondaryAction != null)
                    const SizedBox(width: 12),
                  if (onSecondaryAction != null && secondaryActionLabel != null)
                    SecondaryButton(
                      text: secondaryActionLabel!,
                      onPressed: onSecondaryAction,
                    ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
