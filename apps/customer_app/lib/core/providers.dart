import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/generated/buyme.swagger.dart';
import 'api/buyme_api_client.dart';
import 'api/api_models.dart';
import 'api/customer_repository.dart';
import 'auth/auth_controller.dart';
import 'auth/token_store.dart';
import 'push/push_notification_service.dart';
import 'realtime/order_live_updates.dart';
import 'state/location_state.dart';

final tokenStoreProvider = Provider<TokenStore>((ref) => TokenStore());

final initialSessionProvider = Provider<bool>((ref) => false);

final firebaseRuntimeReadyProvider = Provider<bool>((ref) => false);

final firebaseRuntimeErrorProvider = Provider<String?>((ref) => null);

final pushNotificationServiceProvider = Provider<PushNotificationService>(
  (ref) => PushNotificationService(),
);

final buymeApiProvider = Provider<Buyme>(
  (ref) => createBuymeApi(ref.watch(tokenStoreProvider)),
);

final Provider<CustomerRepository> customerRepositoryProvider =
    Provider<CustomerRepository>(
      (ref) => CustomerRepository(
        ref.watch(buymeApiProvider),
        ref.watch(tokenStoreProvider),
        onSessionExpired: () =>
            ref.read(authControllerProvider.notifier).expireSession(),
      ),
    );

final StateNotifierProvider<AuthController, AuthState> authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>(
      (ref) => AuthController(
        ref.watch(customerRepositoryProvider),
        hasSession: ref.watch(initialSessionProvider),
      ),
    );

final selectedLocationProvider = StateProvider<LocationSelection?>(
  (ref) => null,
);

final catalogProvider =
    FutureProvider.family<List<CatalogProduct>, (String, String?)>(
      (ref, query) => ref
          .watch(customerRepositoryProvider)
          .catalog(query.$1, query: query.$2),
    );

final categoriesProvider = FutureProvider<List<ProductCategory>>(
  (ref) => ref.watch(customerRepositoryProvider).categories(),
);

final cartProvider = FutureProvider.family<List<CartItem>, String>(
  (ref, storeId) => ref.watch(customerRepositoryProvider).cart(storeId),
);

final addressesProvider = FutureProvider<List<DeliveryAddress>>(
  (ref) => ref.watch(customerRepositoryProvider).addresses(),
);

final ordersProvider = FutureProvider<List<CustomerOrder>>(
  (ref) => ref.watch(customerRepositoryProvider).orders(),
);

final orderProvider = FutureProvider.family<CustomerOrder, String>(
  (ref, id) => ref.watch(customerRepositoryProvider).order(id),
);

final storeProvider = FutureProvider.family<Store, String>(
  (ref, id) => ref.watch(customerRepositoryProvider).store(id),
);

final deliveryRouteProvider =
    FutureProvider.family<List<LatLngPoint>, (double, double, double, double)>(
      (ref, coordinates) => ref
          .watch(customerRepositoryProvider)
          .route(
            fromLatitude: coordinates.$1,
            fromLongitude: coordinates.$2,
            toLatitude: coordinates.$3,
            toLongitude: coordinates.$4,
          ),
    );

final customerProfileProvider = FutureProvider<JsonMap>(
  (ref) => ref.watch(customerRepositoryProvider).profile(),
);

final orderLiveEventsProvider = StreamProvider.autoDispose
    .family<OrderLiveEvent, String>(
      (ref, orderId) => OrderLiveUpdates(
        ref.watch(customerRepositoryProvider),
      ).watchOrder(orderId),
    );
