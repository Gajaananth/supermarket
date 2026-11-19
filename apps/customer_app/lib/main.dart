import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'core/auth/token_store.dart';
import 'core/navigation/app_router.dart';
import 'core/providers.dart';
import 'core/push/firebase_bootstrap.dart';
import 'core/theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final tokenStore = TokenStore();
  final accessToken = await tokenStore.readAccessToken();
  final firebaseError = await initializeFirebase();
  runApp(
    ProviderScope(
      overrides: [
        tokenStoreProvider.overrideWithValue(tokenStore),
        initialSessionProvider.overrideWithValue(
          accessToken != null && accessToken.isNotEmpty,
        ),
        firebaseRuntimeReadyProvider.overrideWithValue(firebaseError == null),
        firebaseRuntimeErrorProvider.overrideWithValue(firebaseError),
      ],
      child: const BuyMeCustomerApp(),
    ),
  );
}

class BuyMeCustomerApp extends ConsumerWidget {
  const BuyMeCustomerApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final GoRouter router = ref.watch(appRouterProvider);
    return MaterialApp.router(
      title: 'BuyMe',
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      routerConfig: router,
    );
  }
}
