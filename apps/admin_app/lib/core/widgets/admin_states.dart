import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class AdminLoading extends StatelessWidget {
  const AdminLoading({required this.label, super.key});

  final String label;

  @override
  Widget build(BuildContext context) => Center(
    child: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const CircularProgressIndicator(color: AppColors.primaryRed),
        const SizedBox(height: 14),
        Text(label, style: const TextStyle(color: AppColors.secondaryText)),
      ],
    ),
  );
}

class AdminError extends StatelessWidget {
  const AdminError({required this.message, this.onRetry, super.key});

  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            LucideIcons.triangleAlert,
            color: AppColors.error,
            size: 32,
          ),
          const SizedBox(height: 12),
          Text(message, textAlign: TextAlign.center),
          if (onRetry != null) ...[
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: onRetry,
              icon: const Icon(LucideIcons.refreshCw),
              label: const Text('Try again'),
            ),
          ],
        ],
      ),
    ),
  );
}

class AdminEmpty extends StatelessWidget {
  const AdminEmpty({required this.title, required this.message, super.key});

  final String title;
  final String message;

  @override
  Widget build(BuildContext context) => Center(
    child: EmptyState(
      icon: LucideIcons.inbox,
      title: title,
      description: message,
    ),
  );
}

class AdminSectionCard extends StatelessWidget {
  const AdminSectionCard({
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.borderColor,
    this.onTap,
    super.key,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color? borderColor;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) => Card(
    color: AppColors.white,
    elevation: 0,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(20),
      side: BorderSide(color: borderColor ?? AppColors.borderMedium),
    ),
    child: InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Padding(padding: padding, child: child),
    ),
  );
}

String formatLkr(Object? amount) {
  final value = amount is num ? amount.toDouble() : double.tryParse('$amount');
  if (value == null) return 'LKR --';
  return 'LKR ${value.toStringAsFixed(2)}';
}
