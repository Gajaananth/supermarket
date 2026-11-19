import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/api/rider_models.dart';
import '../../../core/providers.dart';

class RiderProfileScreen extends ConsumerWidget {
  const RiderProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) => Scaffold(
    appBar: AppBar(title: const Text('Rider account')),
    body: FutureBuilder<JsonMap>(
      future: ref.read(riderRepositoryProvider).profile(),
      builder: (context, snapshot) {
        final userValue = snapshot.data?['user'];
        final user = userValue is Map
            ? userValue.map((key, value) => MapEntry('$key', value))
            : const <String, Object?>{};
        if (snapshot.hasError) {
          return Center(child: ErrorState(message: '${snapshot.error}'));
        }
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            GlassCard(
              opaqueTextSurface: true,
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 36,
                    backgroundColor: AppColors.primaryRed,
                    child: Icon(LucideIcons.userRound, color: Colors.white, size: 30),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    stringValue(user['fullName'], fallback: 'Rider'),
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  Text(stringValue(user['phone'], fallback: stringValue(user['email']))),
                ],
              ),
            ),
            const SizedBox(height: 14),
            GlassCard(
              opaqueTextSurface: true,
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(LucideIcons.wallet),
                    title: const Text('Cash & deposits'),
                    trailing: const Icon(LucideIcons.chevronRight),
                    onTap: () => context.push('/cash'),
                  ),
                  ListTile(
                    leading: const Icon(LucideIcons.fileCheck2),
                    title: const Text('KYC verification'),
                    trailing: const Icon(LucideIcons.chevronRight),
                    onTap: () => context.push('/kyc'),
                  ),
                  ListTile(
                    leading: const Icon(LucideIcons.logOut),
                    title: const Text('Sign out'),
                    onTap: () => ref.read(riderAuthProvider.notifier).signOut(),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    ),
  );
}
