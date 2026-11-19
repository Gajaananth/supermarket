import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/addresses/presentation/addresses_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/cart/presentation/cart_screen.dart';
import '../../features/catalog/presentation/categories_screen.dart';
import '../../features/catalog/presentation/shop_screen.dart';
import '../../features/checkout/presentation/checkout_screen.dart';
import '../../features/location/presentation/location_screen.dart';
import '../../features/orders/presentation/order_tracking_screen.dart';
import '../../features/orders/presentation/orders_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../providers.dart';
import 'customer_shell.dart';
import 'router_refresh.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final refresh = RouterRefresh();
  ref.listen(authControllerProvider, (previous, next) => refresh.refresh());
  ref.listen(selectedLocationProvider, (previous, next) => refresh.refresh());

  final router = GoRouter(
    initialLocation: '/location',
    refreshListenable: refresh,
    redirect: (context, state) {
      final path = state.uri.path;
      final hasLocation = ref.read(selectedLocationProvider) != null;
      final authenticated = ref.read(authControllerProvider).isAuthenticated;

      if (!hasLocation && path != '/location' && path != '/login') {
        return '/location';
      }
      if (_requiresAuthentication(path) && !authenticated) {
        return Uri(
          path: '/login',
          queryParameters: {'redirect': state.uri.toString()},
        ).toString();
      }
      if (path == '/login' && authenticated) {
        return state.uri.queryParameters['redirect'] ?? '/shop';
      }
      if (path == '/') return hasLocation ? '/shop' : '/location';
      return null;
    },
    routes: [
      GoRoute(
        path: '/location',
        builder: (context, state) => const LocationScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) =>
            LoginScreen(redirectTo: state.uri.queryParameters['redirect']),
      ),
      GoRoute(
        path: '/checkout',
        builder: (context, state) => const CheckoutScreen(),
      ),
      GoRoute(
        path: '/addresses',
        builder: (context, state) => const AddressesScreen(),
      ),
      GoRoute(
        path: '/tracking/:orderId',
        builder: (context, state) =>
            OrderTrackingScreen(orderId: state.pathParameters['orderId']!),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            CustomerShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/shop',
                builder: (context, state) => const ShopScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/categories',
                builder: (context, state) => const CategoriesScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/cart',
                builder: (context, state) => const CartScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/orders',
                builder: (context, state) => const OrdersScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
  ref.onDispose(() {
    router.dispose();
    refresh.dispose();
  });
  return router;
});

bool _requiresAuthentication(String path) =>
    path == '/cart' ||
    path == '/checkout' ||
    path == '/addresses' ||
    path == '/orders' ||
    path.startsWith('/tracking/');
