import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../tokens/app_colors.dart';
import '../tokens/app_typography.dart';

enum BuyMeStepState { completed, active, pending }

class TimelineStepItem {
  final String title;
  final String? titleTa;
  final String? subtitle;
  final String? time;
  final BuyMeStepState state;
  final IconData? icon;

  const TimelineStepItem({
    required this.title,
    this.titleTa,
    this.subtitle,
    this.time,
    required this.state,
    this.icon,
  });
}

/// BuyMe Stepper & Timeline Widget for Order Delivery Tracking
class StepperTimeline extends StatelessWidget {
  final List<TimelineStepItem> steps;

  const StepperTimeline({
    super.key,
    required this.steps,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(steps.length, (index) {
        final step = steps[index];
        final isLast = index == steps.length - 1;

        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Indicator column (circle + connecting line)
              SizedBox(
                width: 36,
                child: Column(
                  children: [
                    // Step Circle
                    _buildStepIndicator(step),
                    // Vertical Line
                    if (!isLast)
                      Expanded(
                        child: Container(
                          width: 2,
                          color: step.state == BuyMeStepState.completed
                              ? AppColors.neonBlue
                              : AppColors.borderCard,
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 14),

              // Content column
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(bottom: isLast ? 0 : 22),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              step.title,
                              style: AppTypography.h4.copyWith(
                                fontSize: 14.5,
                                fontWeight: step.state == BuyMeStepState.active
                                    ? FontWeight.w800
                                    : FontWeight.w700,
                                color: step.state == BuyMeStepState.pending
                                    ? AppColors.mutedText
                                    : AppColors.darkNavy,
                              ),
                            ),
                          ),
                          if (step.time != null)
                            Text(
                              step.time!,
                              style: AppTypography.caption.copyWith(
                                fontWeight: FontWeight.w600,
                                color: step.state == BuyMeStepState.active
                                    ? AppColors.neonBlue
                                    : AppColors.mutedText,
                              ),
                            ),
                        ],
                      ),
                      if (step.titleTa != null) ...[
                        const SizedBox(height: 1),
                        Text(
                          step.titleTa!,
                          style: AppTypography.tamilBody(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: AppColors.mutedText,
                          ),
                        ),
                      ],
                      if (step.subtitle != null) ...[
                        const SizedBox(height: 3),
                        Text(
                          step.subtitle!,
                          style: AppTypography.bodySmall.copyWith(
                            color: step.state == BuyMeStepState.pending
                                ? AppColors.subtleText
                                : AppColors.secondaryText,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildStepIndicator(TimelineStepItem step) {
    switch (step.state) {
      case BuyMeStepState.completed:
        return Container(
          width: 28,
          height: 28,
          decoration: const BoxDecoration(
            color: AppColors.neonBlue,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Color(0x40168BFF),
                blurRadius: 8,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Icon(
            step.icon ?? LucideIcons.check,
            size: 14,
            color: Colors.white,
          ),
        );
      case BuyMeStepState.active:
        return Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.neonBlue, width: 2.5),
            boxShadow: const [
              BoxShadow(
                color: Color(0x33168BFF),
                blurRadius: 10,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Center(
            child: Container(
              width: 10,
              height: 10,
              decoration: const BoxDecoration(
                color: AppColors.neonBlue,
                shape: BoxShape.circle,
              ),
            ),
          ),
        );
      case BuyMeStepState.pending:
        return Container(
          width: 24,
          height: 24,
          margin: const EdgeInsets.symmetric(vertical: 2),
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F9),
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFFCBD5E1), width: 1.5),
          ),
          child: Center(
            child: Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                color: Color(0xFF94A3B8),
                shape: BoxShape.circle,
              ),
            ),
          ),
        );
    }
  }
}
