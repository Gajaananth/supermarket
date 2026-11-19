import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'api/admin_repository.dart';
import 'api/buyme_api_client.dart';
import 'auth/admin_auth_controller.dart';
import 'auth/token_store.dart';

final adminTokenStoreProvider = Provider<TokenStore>((ref) => TokenStore());

final buymeApiProvider = Provider((ref) {
  return createBuymeApi(ref.watch(adminTokenStoreProvider));
});

final adminRepositoryProvider = Provider((ref) {
  return AdminRepository(
    ref.watch(buymeApiProvider),
    ref.watch(adminTokenStoreProvider),
  );
});

final adminAuthProvider =
    StateNotifierProvider<AdminAuthController, AdminAuthState>((ref) {
      return AdminAuthController(
        ref.watch(adminRepositoryProvider),
        ref.watch(adminTokenStoreProvider),
      );
    });
