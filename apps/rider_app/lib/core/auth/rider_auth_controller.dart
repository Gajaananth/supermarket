import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/rider_repository.dart';
import 'token_store.dart';

class RiderAuthState {
  const RiderAuthState({this.isLoading = true, this.isSignedIn = false});

  final bool isLoading;
  final bool isSignedIn;
}

class RiderAuthController extends StateNotifier<RiderAuthState> {
  RiderAuthController(this._tokens, this._repository)
    : super(const RiderAuthState()) {
    restore();
  }

  final TokenStore _tokens;
  final RiderRepository _repository;

  Future<void> restore() async {
    final token = await _tokens.readAccessToken();
    final refresh = await _tokens.readRefreshToken();
    state = RiderAuthState(
      isLoading: false,
      isSignedIn: token?.isNotEmpty == true && refresh?.isNotEmpty == true,
    );
  }

  Future<void> signIn({
    required String destination,
    required String code,
  }) async {
    await _repository.verifyOtp(destination: destination, code: code);
    state = const RiderAuthState(isSignedIn: true);
  }

  Future<void> signOut() async {
    try {
      await _repository.logout();
    } finally {
      await _tokens.clear();
      state = const RiderAuthState(isSignedIn: false);
    }
  }
}
