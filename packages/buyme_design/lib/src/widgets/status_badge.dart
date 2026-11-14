import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../tokens/app_colors.dart';
import '../tokens/app_radii.dart';
import '../tokens/app_typography.dart';

enum BuyMeOrderStatus {
  pending,
  confirmed,
  preparing,
  ready,
  outForDelivery,
  delivered,
  cancelled,
}

/// BuyMe Status Badge for Order & Delivery Tracking
class StatusBadge extends StatelessWidget {
  final BuyMeOrderStatus status;
  final String? customLabel;
  final bool showIcon;
  final bool isCompact;

  const StatusBadge({
    super.key,
    required this.status,
    this.customLabel,
    this.showIcon = true,
    this.isCompact = false,
  });

  _BadgeStyle _getStyle() {
    switch (status) {
      case BuyMeOrderStatus.pending:
        return _BadgeStyle(
          label: "Pending",
          labelTa: "நிலுவையில்",
          color: AppColors.warning,
          bg: AppColors.warningLight,
          border: AppColors.warningBorder,
          icon: LucideIcons.clock,
        );
      case BuyMeOrderStatus.confirmed:
        return _BadgeStyle(
          label: "Confirmed",
          labelTa: "உறுதிப்படுத்தப்பட்டது",
          color: AppColors.neonBlue,
          bg: AppColors.infoLight,
          border: AppColors.infoBorder,
          icon: LucideIcons.checkCircle2,
        );
      case BuyMeOrderStatus.preparing:
        return _BadgeStyle(
          label: "Preparing",
          labelTa: "தயாராகிறது",
          color: const Color(0xFF8B5CF6),
          bg: const Color(0xFFF5F3FF),
          border: const Color(0xFFDDD6FE),
          icon: LucideIcons.packageCheck,
        );
      case BuyMeOrderStatus.ready:
        return _BadgeStyle(
          label: "Ready for Pickup",
          labelTa: "எடுக்கத் தயார்",
          color: const Color(0xFF0284C7),
          bg: const Color(0xFFF0F9FF),
          border: const Color(0xFFBAE6FD),
          icon: LucideIcons.shoppingBag,
        );
      case BuyMeOrderStatus.outForDelivery:
        return _BadgeStyle(
          label: "Out for Delivery",
          labelTa: "விநியோகத்தில்",
          color: AppColors.neonBlue,
          bg: AppColors.softBlue,
          border: AppColors.borderNeon,
          icon: LucideIcons.bike,
        );
      case BuyMeOrderStatus.delivered:
        return _BadgeStyle(
          label: "Delivered",
          labelTa: "வழங்கப்பட்டது",
          color: AppColors.success,
          bg: AppColors.successLight,
          border: AppColors.successBorder,
          icon: LucideIcons.checkCheck,
        );
      case BuyMeOrderStatus.cancelled:
        return _BadgeStyle(
          label: "Cancelled",
          labelTa: "ரத்து செய்யப்பட்டது",
          color: AppColors.error,
          bg: AppColors.errorLight,
          border: AppColors.errorBorder,
          icon: LucideIcons.xCircle,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final style = _getStyle();
    final text = customLabel ?? style.label;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isCompact ? 8 : 10,
        vertical: isCompact ? 3 : 5,
      ),
      decoration: BoxDecoration(
        color: style.bg,
        borderRadius: AppRadii.borderFull,
        border: Border.all(color: style.border, width: 0.8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (showIcon) ...[
            Icon(
              style.icon,
              size: isCompact ? 11 : 13,
              color: style.color,
            ),
            const SizedBox(width: 5),
          ] else ...[
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                color: style.color,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 6),
          ],
          Text(
            text,
            style: AppTypography.caption.copyWith(
              fontSize: isCompact ? 10 : 11.5,
              fontWeight: FontWeight.w700,
              color: style.color,
            ),
          ),
        ],
      ),
    );
  }
}

class _BadgeStyle {
  final String label;
  final String labelTa;
  final Color color;
  final Color bg;
  final Color border;
  final IconData icon;

  const _BadgeStyle({
    required this.label,
    required this.labelTa,
    required this.color,
    required this.bg,
    required this.border,
    required this.icon,
  });
}

