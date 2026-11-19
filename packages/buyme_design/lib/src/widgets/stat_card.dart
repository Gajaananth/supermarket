import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../tokens/app_colors.dart';
import '../tokens/app_radii.dart';
import '../tokens/app_shadows.dart';
import '../tokens/app_typography.dart';

/// BuyMe KPI Stat Card for Dashboards & Metrics
/// Displays key business metrics with Lucide icons, trend badges, and frosted glass surface.
class StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final String? trendText;
  final bool? isPositiveTrend;
  final String? subtitle;
  final Color iconColor;
  final VoidCallback? onTap;

  const StatCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    this.trendText,
    this.isPositiveTrend,
    this.subtitle,
    this.iconColor = AppColors.neonBlue,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        borderRadius: AppRadii.border2Xl,
        boxShadow: AppShadows.card,
      ),
      child: ClipRRect(
        borderRadius: AppRadii.border2Xl,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onTap,
              borderRadius: AppRadii.border2Xl,
              child: Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppColors.glassFill,
                  borderRadius: AppRadii.border2Xl,
                  border: Border.all(
                    color: AppColors.glassBorder,
                    width: 1.0,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Top row: Icon and Trend
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Frosted Icon Container
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: iconColor.withOpacity(0.12),
                            borderRadius: AppRadii.borderLg,
                            border: Border.all(
                              color: iconColor.withOpacity(0.25),
                              width: 1.0,
                            ),
                          ),
                          child: Icon(
                            icon,
                            color: iconColor,
                            size: 22,
                          ),
                        ),

                        // Trend Badge
                        if (trendText != null && isPositiveTrend != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: isPositiveTrend!
                                  ? AppColors.successLight
                                  : AppColors.errorLight,
                              borderRadius: AppRadii.borderFull,
                              border: Border.all(
                                color: isPositiveTrend!
                                    ? AppColors.successBorder
                                    : AppColors.errorBorder,
                                width: 0.8,
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  isPositiveTrend!
                                      ? LucideIcons.trendingUp
                                      : LucideIcons.trendingDown,
                                  size: 13,
                                  color: isPositiveTrend!
                                      ? AppColors.success
                                      : AppColors.error,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  trendText!,
                                  style: AppTypography.caption.copyWith(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 10.5,
                                    color: isPositiveTrend!
                                        ? AppColors.success
                                        : AppColors.error,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Metric Value (Manrope Bold)
                    Text(
                      value,
                      style: AppTypography.h2.copyWith(
                        fontSize: 22,
                        letterSpacing: -0.4,
                        color: AppColors.darkNavy,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),

                    // Label / Title
                    Text(
                      title,
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.secondaryText,
                        fontWeight: FontWeight.w600,
                      ),
                    ),

                    // Optional subtitle
                    if (subtitle != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        subtitle!,
                        style: AppTypography.caption.copyWith(
                          color: AppColors.mutedText,
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

