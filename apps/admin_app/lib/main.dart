import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/navigation/app_router.dart';
import 'core/push/firebase_bootstrap.dart';
import 'core/theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeFirebaseIfConfigured();
  runApp(const ProviderScope(child: BuyMeAdminApp()));
}

class BuyMeAdminApp extends ConsumerWidget {
  const BuyMeAdminApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(adminRouterProvider);
    return MaterialApp.router(
      title: 'BuyMe Admin',
      debugShowCheckedModeBanner: false,
      theme: buildAdminTheme(),
      routerConfig: router,
    );
  }
}
