import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/cash/presentation/cash_screen.dart';
import '../../features/delivery/presentation/delivery_screen.dart';
import '../../features/home/presentation/rider_home_screen.dart';
import '../../features/kyc/presentation/kyc_screen.dart';
import '../../features/profile/presentation/rider_profile_screen.dart';
import '../providers.dart';
import 'router_refresh.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authController = ref.watch(riderAuthProvider.notifier);
  final refresh = RouterRefresh(authController);
  ref.onDispose(refresh.dispose);
  return GoRouter(
    initialLocation: '/',
    refreshListenable: refresh,
    redirect: (context, state) {
      final auth = ref.read(riderAuthProvider);
      if (auth.isLoading) return null;
      final isLogin = state.matchedLocation == '/login';
      if (!auth.isSignedIn && !isLogin) return '/login';
      if (auth.isSignedIn && isLogin) return '/';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(path: '/', builder: (context, state) => const RiderHomeScreen()),
      GoRoute(path: '/kyc', builder: (context, state) => const KycScreen()),
      GoRoute(path: '/cash', builder: (context, state) => const CashScreen()),
      GoRoute(
        path: '/delivery/:orderId',
        builder: (context, state) => DeliveryScreen(
          orderId: state.pathParameters['orderId']!,
        ),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const RiderProfileScreen(),
      ),
    ],
  );
});
