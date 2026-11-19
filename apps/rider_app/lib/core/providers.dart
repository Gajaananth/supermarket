import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/generated/buyme.swagger.dart';
import 'api/buyme_api_client.dart';
import 'api/rider_repository.dart';
import 'auth/rider_auth_controller.dart';
import 'auth/token_store.dart';
import 'location/rider_location_service.dart';
import 'realtime/rider_realtime.dart';

final tokenStoreProvider = Provider<TokenStore>((ref) => TokenStore());
final apiProvider = Provider<Buyme>(
  (ref) => createBuymeApi(ref.watch(tokenStoreProvider)),
);
final riderRepositoryProvider = Provider<RiderRepository>(
  (ref) => RiderRepository(
    ref.watch(apiProvider),
    ref.watch(tokenStoreProvider),
  ),
);
final riderAuthProvider =
    StateNotifierProvider<RiderAuthController, RiderAuthState>((ref) {
      return RiderAuthController(
        ref.watch(tokenStoreProvider),
        ref.watch(riderRepositoryProvider),
      );
    });
final riderLocationServiceProvider = FutureProvider<RiderLocationService>(
  (ref) => RiderLocationService.configure(),
);
final riderRealtimeProvider = Provider<RiderRealtime>((ref) {
  final realtime = RiderRealtime(ref.watch(riderRepositoryProvider));
  ref.onDispose(realtime.dispose);
  return realtime;
});
