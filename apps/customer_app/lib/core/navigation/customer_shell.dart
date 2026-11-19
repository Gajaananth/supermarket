import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class CustomerShell extends StatelessWidget {
  const CustomerShell({required this.navigationShell, super.key});

  final StatefulNavigationShell navigationShell;

  static const _destinations = <_Destination>[
    _Destination('Shop', LucideIcons.store),
    _Destination('Categories', LucideIcons.layoutGrid),
    _Destination('Cart', LucideIcons.shoppingCart),
    _Destination('Orders', LucideIcons.package),
    _Destination('Profile', LucideIcons.user),
  ];

  @override
  Widget build(BuildContext context) {
    return GlassScaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) {
          navigationShell.goBranch(
            index,
            initialLocation: index == navigationShell.currentIndex,
          );
        },
        backgroundColor: AppColors.glassFillOpaque,
        indicatorColor: AppColors.softRed,
        destinations: [
          for (var index = 0; index < _destinations.length; index++)
            NavigationDestination(
              icon: Icon(_destinations[index].icon, size: 20),
              selectedIcon: Icon(
                _destinations[index].icon,
                size: 20,
                color: AppColors.primaryRed,
              ),
              label: _destinations[index].label,
            ),
        ],
      ),
    );
  }
}

class _Destination {
  const _Destination(this.label, this.icon);

  final String label;
  final IconData icon;
}
