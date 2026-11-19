import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/providers.dart';
import '../../../core/widgets/admin_states.dart';

class MoreScreen extends ConsumerWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(adminAuthProvider);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        AdminSectionCard(
          child: Row(
            children: [
              const CircleAvatar(
                backgroundColor: AppColors.softRed,
                child: Icon(LucideIcons.userRound, color: AppColors.primaryRed),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      auth.session?.fullName ?? 'Admin',
                      style: const TextStyle(fontWeight: FontWeight.w900),
                    ),
                    Text(
                      auth.session?.role.replaceAll('_', ' ') ?? '',
                      style: const TextStyle(color: AppColors.secondaryText),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        _OperationLink(
          icon: LucideIcons.landmark,
          title: 'Deposit verification',
          subtitle: 'Review rider bank slips and cash variances',
          onTap: () => context.go('/admin/more/deposits'),
        ),
        _OperationLink(
          icon: LucideIcons.mapPinned,
          title: 'Store locations',
          subtitle: 'Select a store and view its approximate map location',
          onTap: () => context.go('/admin/more/stores'),
        ),
        if (auth.session?.isSuperAdmin == true)
          _OperationLink(
            icon: LucideIcons.fileCheck2,
            title: 'Rider KYC review',
            subtitle: 'Review submitted rider documents and assignments',
            onTap: () => context.go('/admin/more/riders'),
          ),
        if (auth.pushWarning != null)
          AdminSectionCard(
            child: Text(
              auth.pushWarning!,
              style: const TextStyle(color: AppColors.warning),
            ),
          ),
      ],
    );
  }
}

class _OperationLink extends StatelessWidget {
  const _OperationLink({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: AdminSectionCard(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      child: ListTile(
        contentPadding: EdgeInsets.zero,
        leading: Icon(icon, color: AppColors.primaryRed),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
        subtitle: Text(subtitle),
        trailing: const Icon(LucideIcons.chevronRight),
        onTap: onTap,
      ),
    ),
  );
}
