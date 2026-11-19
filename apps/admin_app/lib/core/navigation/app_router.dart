import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/deposits/presentation/deposits_screen.dart';
import '../../features/home/presentation/admin_home_screen.dart';
import '../../features/inventory/presentation/inventory_screen.dart';
import '../../features/more/presentation/more_screen.dart';
import '../../features/orders/presentation/orders_screen.dart';
import '../../features/riders/presentation/riders_screen.dart';
import '../../features/stores/presentation/stores_screen.dart';
import '../../features/transfers/presentation/transfers_screen.dart';
import '../providers.dart';
import 'router_refresh.dart';
import '../../features/shell/presentation/admin_shell.dart';

final adminRouterProvider = Provider<GoRouter>((ref) {
  final authController = ref.watch(adminAuthProvider.notifier);
  final refresh = RouterRefresh(authController);
  ref.onDispose(refresh.dispose);
  return GoRouter(
    initialLocation: '/admin',
    refreshListenable: refresh,
    redirect: (context, state) {
      final auth = ref.read(adminAuthProvider);
      final isLogin = state.matchedLocation == '/login';
      if (auth.isLoading) return isLogin ? null : '/login';
      if (!auth.isSignedIn && !isLogin) return '/login';
      if (auth.isSignedIn && isLogin) return '/admin';
      if (auth.session?.isSuperAdmin != true &&
          state.matchedLocation == '/admin/more/riders') {
        return '/admin/more';
      }
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) => AdminShell(
          navigationShell: navigationShell,
          location: state.matchedLocation,
        ),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/admin',
                builder: (context, state) => const AdminHomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/admin/orders',
                builder: (context, state) => const OrdersScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/admin/inventory',
                builder: (context, state) => const InventoryScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/admin/transfers',
                builder: (context, state) => const TransfersScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/admin/more',
                builder: (context, state) => const MoreScreen(),
                routes: [
                  GoRoute(
                    path: 'deposits',
                    builder: (context, state) => const DepositsScreen(),
                  ),
                  GoRoute(
                    path: 'stores',
                    builder: (context, state) => const StoresScreen(),
                  ),
                  GoRoute(
                    path: 'riders',
                    builder: (context, state) => const RidersScreen(),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
