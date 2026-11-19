import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/navigation/app_router.dart';
import 'core/providers.dart';
import 'core/theme/app_theme.dart';
import 'core/push/firebase_bootstrap.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: BuyMeRiderApp()));
}

class BuyMeRiderApp extends ConsumerStatefulWidget {
  const BuyMeRiderApp({super.key});

  @override
  ConsumerState<BuyMeRiderApp> createState() => _BuyMeRiderAppState();
}

class _BuyMeRiderAppState extends ConsumerState<BuyMeRiderApp> {
  bool _pushInitialized = false;

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(riderAuthProvider);
    final router = ref.watch(appRouterProvider);
    if (auth.isSignedIn && !_pushInitialized) {
      _pushInitialized = true;
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        final messenger = ScaffoldMessenger.of(context);
        try {
          await initializeRiderPush(ref.read(riderRepositoryProvider));
        } catch (error) {
          if (mounted) {
            messenger.showSnackBar(
              SnackBar(content: Text('Push notifications could not initialize: $error')),
            );
          }
        }
      });
    }
    return MaterialApp.router(
      title: 'BuyMe Rider',
      debugShowCheckedModeBanner: false,
      theme: buildRiderTheme(),
      routerConfig: router,
    );
  }
}
