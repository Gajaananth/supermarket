import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/providers.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    final firebaseReady = ref.watch(firebaseRuntimeReadyProvider);
    final firebaseError = ref.watch(firebaseRuntimeErrorProvider);
    final profile = auth.isAuthenticated
        ? ref.watch(customerProfileProvider)
        : null;

    return GlassScaffold(
      appBar: AppBar(title: Text('Profile', style: AppTypography.h3)),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          GlassCard(
            opaqueTextSurface: true,
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 26,
                  backgroundColor: AppColors.softRed,
                  child: Icon(LucideIcons.user, color: AppColors.primaryRed),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: profile == null
                      ? Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Welcome to BuyMe', style: AppTypography.h4),
                            Text(
                              'Sign in to manage orders and addresses.',
                              style: AppTypography.bodySmall,
                            ),
                          ],
                        )
                      : profile.when(
                          loading: () => const LinearProgressIndicator(),
                          error: (error, stackTrace) => Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Profile unavailable',
                                style: AppTypography.h4,
                              ),
                              Text('$error', style: AppTypography.bodySmall),
                            ],
                          ),
                          data: (data) => Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _readString(data, 'fullName') ?? 'Customer',
                                style: AppTypography.h4,
                              ),
                              Text(
                                _readString(data, 'phone') ??
                                    'Customer account',
                                style: AppTypography.bodySmall,
                              ),
                            ],
                          ),
                        ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          _ProfileAction(
            icon: LucideIcons.package,
            title: 'Order history',
            onTap: () => context.go('/orders'),
          ),
          _ProfileAction(
            icon: LucideIcons.mapPin,
            title: 'Saved delivery addresses',
            onTap: () => context.push('/addresses'),
          ),
          _ProfileAction(
            icon: LucideIcons.mapPin,
            title: 'Change delivery location',
            onTap: () => context.go('/location'),
          ),
          const SizedBox(height: 14),
          GlassCard(
            opaqueTextSurface: true,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  firebaseReady ? LucideIcons.bellRing : LucideIcons.bellOff,
                  color: firebaseReady ? AppColors.success : AppColors.warning,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Push notifications', style: AppTypography.h4),
                      const SizedBox(height: 4),
                      Text(
                        firebaseError ??
                            (firebaseReady
                                ? 'Firebase is connected. Enable notifications after sign-in.'
                                : 'Firebase project configuration is required to enable notifications.'),
                        style: AppTypography.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          if (auth.isAuthenticated)
            OutlinedButton.icon(
              onPressed: auth.isBusy
                  ? null
                  : () async {
                      try {
                        await ref
                            .read(authControllerProvider.notifier)
                            .logout();
                        ref.invalidate(customerProfileProvider);
                      } catch (error) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(
                            context,
                          ).showSnackBar(SnackBar(content: Text('$error')));
                        }
                      }
                    },
              icon: auth.isBusy
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(LucideIcons.logOut, size: 18),
              label: const Text('Sign out'),
            )
          else
            PrimaryButton(
              text: 'Sign in',
              icon: const Icon(LucideIcons.logIn, size: 18),
              onPressed: () => context.go('/login?redirect=%2Fprofile'),
            ),
        ],
      ),
    );
  }

  String? _readString(Map<String, Object?> data, String key) {
    final value = data[key];
    return value is String && value.isNotEmpty ? value : null;
  }
}

class _ProfileAction extends StatelessWidget {
  const _ProfileAction({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: GlassCard(
        opaqueTextSurface: true,
        padding: EdgeInsets.zero,
        child: ListTile(
          leading: Icon(icon, color: AppColors.primaryRed, size: 20),
          title: Text(title, style: AppTypography.bodyMedium),
          trailing: const Icon(LucideIcons.chevronRight, size: 18),
          onTap: onTap,
        ),
      ),
    );
  }
}
