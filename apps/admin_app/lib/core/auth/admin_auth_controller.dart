import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/admin_models.dart';
import '../api/admin_repository.dart';
import '../api/app_error.dart';
import '../config/app_config.dart';
import 'token_store.dart';

class AdminAuthState {
  const AdminAuthState({
    this.isLoading = true,
    this.isSignedIn = false,
    this.requires2fa = false,
    this.session,
    this.stores = const [],
    this.selectedStoreId,
    this.challengeEmail,
    this.demoCode,
    this.error,
    this.pushWarning,
  });

  final bool isLoading;
  final bool isSignedIn;
  final bool requires2fa;
  final AdminSession? session;
  final List<AdminStore> stores;
  final String? selectedStoreId;
  final String? challengeEmail;
  final String? demoCode;
  final String? error;
  final String? pushWarning;
}

class AdminAuthController extends StateNotifier<AdminAuthState> {
  AdminAuthController(this._repository, this._tokens)
    : super(const AdminAuthState()) {
    restore();
  }

  final AdminRepository _repository;
  final TokenStore _tokens;

  Future<void> restore() async {
    final access = await _tokens.readAccessToken();
    final refresh = await _tokens.readRefreshToken();
    if ((access == null || access.isEmpty) &&
        (refresh == null || refresh.isEmpty)) {
      state = const AdminAuthState(isLoading: false, isSignedIn: false);
      return;
    }
    try {
      await _establishSession();
    } on AdminApiException catch (error) {
      if (error.statusCode == 401) await _tokens.clearTokens();
      state = AdminAuthState(isLoading: false, error: error.message);
    } on FormatException catch (error) {
      state = AdminAuthState(isLoading: false, error: error.message);
    }
  }

  Future<void> signIn({required String email, required String password}) async {
    state = const AdminAuthState(isLoading: true);
    try {
      final response = await _repository.adminLogin(
        email: email,
        password: password,
      );
      if (response['requires2fa'] == true) {
        state = AdminAuthState(
          isLoading: false,
          requires2fa: true,
          challengeEmail: response['email'] is String
              ? response['email'] as String
              : email.trim(),
          demoCode: response['demoCode'] is String
              ? response['demoCode'] as String
              : null,
        );
        return;
      }
      await _repository.saveSessionTokens(response);
      await _establishSession();
    } on AdminApiException catch (error) {
      state = AdminAuthState(isLoading: false, error: error.message);
    } on FormatException catch (error) {
      state = AdminAuthState(isLoading: false, error: error.message);
    }
  }

  Future<void> verifyTwoFactor(String code) async {
    final email = state.challengeEmail;
    if (email == null || email.isEmpty) {
      state = const AdminAuthState(
        isLoading: false,
        error: 'Start admin sign-in again to request a new verification code.',
      );
      return;
    }
    state = AdminAuthState(
      isLoading: true,
      requires2fa: true,
      challengeEmail: email,
      demoCode: state.demoCode,
    );
    try {
      final response = await _repository.verify2fa(email: email, code: code);
      await _repository.saveSessionTokens(response);
      await _establishSession();
    } on AdminApiException catch (error) {
      state = AdminAuthState(
        isLoading: false,
        requires2fa: true,
        challengeEmail: email,
        demoCode: state.demoCode,
        error: error.message,
      );
    } on FormatException catch (error) {
      state = AdminAuthState(
        isLoading: false,
        requires2fa: true,
        challengeEmail: email,
        demoCode: state.demoCode,
        error: error.message,
      );
    }
  }

  void cancelTwoFactor() {
    state = const AdminAuthState(isLoading: false);
  }

  Future<void> selectStore(String storeId) async {
    final session = state.session;
    if (session == null || !session.isSuperAdmin) return;
    if (!state.stores.any((store) => store.id == storeId)) {
      throw ArgumentError.value(storeId, 'storeId', 'Store is not available');
    }
    await _tokens.saveSelectedStoreId(storeId);
    state = AdminAuthState(
      isLoading: false,
      isSignedIn: true,
      session: session,
      stores: state.stores,
      selectedStoreId: storeId,
      pushWarning: state.pushWarning,
    );
  }

  Future<void> signOut() async {
    try {
      await _repository.logout();
    } finally {
      await _tokens.clearTokens();
      state = const AdminAuthState(isLoading: false, isSignedIn: false);
    }
  }

  Future<void> _establishSession() async {
    final session = AdminSession.fromJson(await _repository.profile());
    late final List<AdminStore> stores;
    if (session.isSuperAdmin) {
      stores = (await _repository.storesForSuperAdmin())
          .map(AdminStore.fromJson)
          .toList(growable: false);
    } else {
      final assignedStore = session.store;
      if (assignedStore == null) {
        throw const FormatException(
          'This Store Admin account has no assigned store.',
        );
      }
      stores = [assignedStore];
    }
    final savedStoreId = await _tokens.readSelectedStoreId();
    final savedStoreIsAvailable = stores.any(
      (store) => store.id == savedStoreId,
    );
    final selectedStoreId = session.isSuperAdmin
        ? savedStoreIsAvailable
              ? savedStoreId
              : stores.isEmpty
              ? null
              : stores.first.id
        : session.store?.id;
    if (selectedStoreId != null) {
      await _tokens.saveSelectedStoreId(selectedStoreId);
    }
    state = AdminAuthState(
      isLoading: false,
      isSignedIn: true,
      session: session,
      stores: stores,
      selectedStoreId: selectedStoreId,
    );
    await _registerPushToken();
  }

  Future<void> _registerPushToken() async {
    if (!AppConfig.hasFirebaseOptions) return;
    try {
      final settings = await FirebaseMessaging.instance.requestPermission();
      if (settings.authorizationStatus != AuthorizationStatus.authorized &&
          settings.authorizationStatus != AuthorizationStatus.provisional) {
        state = AdminAuthState(
          isLoading: false,
          isSignedIn: state.isSignedIn,
          session: state.session,
          stores: state.stores,
          selectedStoreId: state.selectedStoreId,
          pushWarning: 'Push notifications are disabled for this device.',
        );
        return;
      }
      final token = await FirebaseMessaging.instance.getToken();
      if (token != null && token.isNotEmpty) {
        await _repository.registerPushToken(token);
      }
    } on FirebaseException catch (error) {
      _setPushWarning(error.message ?? 'Firebase push setup failed.');
    } on PlatformException catch (error) {
      _setPushWarning(error.message ?? 'Device notification setup failed.');
    } on AdminApiException catch (error) {
      _setPushWarning(error.message);
    }
  }

  void _setPushWarning(String warning) {
    state = AdminAuthState(
      isLoading: false,
      isSignedIn: state.isSignedIn,
      session: state.session,
      stores: state.stores,
      selectedStoreId: state.selectedStoreId,
      pushWarning: warning,
    );
  }
}
