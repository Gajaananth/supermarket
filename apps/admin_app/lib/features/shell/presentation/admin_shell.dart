import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/api/app_error.dart';
import '../../../core/api/admin_models.dart';
import '../../../core/providers.dart';

class AdminShell extends ConsumerWidget {
  const AdminShell({
    required this.navigationShell,
    required this.location,
    super.key,
  });

  final StatefulNavigationShell navigationShell;
  final String location;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(adminAuthProvider);
    final auth = ref.read(adminAuthProvider.notifier);
    AdminStore? currentStore;
    for (final store in state.stores) {
      if (store.id == state.selectedStoreId) {
        currentStore = store;
        break;
      }
    }
    final title = switch (location) {
      '/admin/orders' => 'Orders',
      '/admin/inventory' => 'Store inventory',
      '/admin/transfers' => 'Stock transfers',
      '/admin/more/deposits' => 'Deposit verification',
      '/admin/more/stores' => 'Stores',
      '/admin/more/riders' => 'Rider KYC',
      '/admin/more' => 'Operations',
      _ => 'Overview',
    };
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 18,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
            Text(
              currentStore?.name ??
                  (state.session?.isSuperAdmin == true
                      ? 'All stores'
                      : 'Store assignment required'),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.secondaryText,
              ),
            ),
          ],
        ),
        actions: [
          if (state.session?.isSuperAdmin == true && state.stores.isNotEmpty)
            PopupMenuButton<String>(
              tooltip: 'Select store',
              icon: const Icon(LucideIcons.store),
              initialValue: state.selectedStoreId,
              onSelected: (storeId) => auth.selectStore(storeId),
              itemBuilder: (context) => [
                ...state.stores.map(
                  (store) => PopupMenuItem(
                    value: store.id,
                    child: Text('${store.code} · ${store.name}'),
                  ),
                ),
              ],
            ),
          IconButton(
            tooltip: 'Sign out',
            onPressed: () async {
              try {
                await auth.signOut();
              } on AdminApiException catch (error) {
                if (context.mounted) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text(error.message)));
                }
              }
            },
            icon: const Icon(LucideIcons.logOut),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) => navigationShell.goBranch(
          index,
          initialLocation: index == navigationShell.currentIndex,
        ),
        destinations: const [
          NavigationDestination(
            icon: Icon(LucideIcons.layoutDashboard),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.receiptText),
            label: 'Orders',
          ),
          NavigationDestination(icon: Icon(LucideIcons.box), label: 'Stock'),
          NavigationDestination(
            icon: Icon(LucideIcons.truck),
            label: 'Transfers',
          ),
          NavigationDestination(icon: Icon(LucideIcons.menu), label: 'More'),
        ],
      ),
    );
  }
}
