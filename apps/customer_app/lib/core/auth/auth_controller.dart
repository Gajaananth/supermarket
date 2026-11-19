import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/app_error.dart';
import '../api/customer_repository.dart';

class AuthState {
  const AuthState({
    this.isAuthenticated = false,
    this.otpRequested = false,
    this.isBusy = false,
    this.demoCode,
    this.error,
  });

  final bool isAuthenticated;
  final bool otpRequested;
  final bool isBusy;
  final String? demoCode;
  final String? error;

  AuthState copyWith({
    bool? isAuthenticated,
    bool? otpRequested,
    bool? isBusy,
    String? demoCode,
    String? error,
    bool clearError = false,
    bool clearDemoCode = false,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      otpRequested: otpRequested ?? this.otpRequested,
      isBusy: isBusy ?? this.isBusy,
      demoCode: clearDemoCode ? null : demoCode ?? this.demoCode,
      error: clearError ? null : error ?? this.error,
    );
  }
}

class AuthController extends StateNotifier<AuthState> {
  AuthController(this._repository, {required bool hasSession})
    : super(AuthState(isAuthenticated: hasSession));

  final CustomerRepository _repository;

  Future<void> requestOtp(String phone) async {
    state = state.copyWith(isBusy: true, clearError: true);
    try {
      final demoCode = await _repository.requestOtp(phone);
      state = state.copyWith(
        isBusy: false,
        otpRequested: true,
        demoCode: demoCode,
        clearDemoCode: demoCode == null,
      );
    } on AppError catch (error) {
      state = state.copyWith(isBusy: false, error: error.message);
      rethrow;
    } catch (error) {
      state = state.copyWith(
        isBusy: false,
        error: 'Could not request a verification code: $error',
      );
      rethrow;
    }
  }

  Future<void> verifyOtp({required String phone, required String code}) async {
    state = state.copyWith(isBusy: true, clearError: true);
    try {
      await _repository.verifyOtp(phone: phone, code: code);
      state = state.copyWith(
        isBusy: false,
        isAuthenticated: true,
        otpRequested: false,
        clearDemoCode: true,
      );
    } on AppError catch (error) {
      state = state.copyWith(isBusy: false, error: error.message);
      rethrow;
    } catch (error) {
      state = state.copyWith(
        isBusy: false,
        error: 'Could not verify the code: $error',
      );
      rethrow;
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isBusy: true, clearError: true);
    try {
      await _repository.logout();
      state = const AuthState();
    } catch (error) {
      state = state.copyWith(
        isBusy: false,
        error: 'Could not sign out safely: $error',
      );
      rethrow;
    }
  }

  void resetOtp() {
    state = state.copyWith(
      otpRequested: false,
      clearError: true,
      clearDemoCode: true,
    );
  }

  void expireSession() {
    state = const AuthState(
      error: 'Your session expired. Please sign in again.',
    );
  }
}
