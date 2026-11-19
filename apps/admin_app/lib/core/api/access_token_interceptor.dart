import 'dart:async';

import 'package:chopper/chopper.dart';

import '../auth/token_store.dart';

class AccessTokenInterceptor implements Interceptor {
  AccessTokenInterceptor(this._tokens);

  final TokenStore _tokens;

  @override
  FutureOr<Response<BodyType>> intercept<BodyType>(
    Chain<BodyType> chain,
  ) async {
    final token = await _tokens.readAccessToken();
    if (token == null || token.isEmpty) return chain.proceed(chain.request);
    return chain.proceed(
      applyHeader(
        chain.request,
        'Authorization',
        'Bearer $token',
        override: true,
      ),
    );
  }
}
