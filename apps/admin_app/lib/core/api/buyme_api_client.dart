import '../auth/token_store.dart';
import '../config/app_config.dart';
import 'access_token_interceptor.dart';

import '../../api/generated/buyme.swagger.dart';

Buyme createBuymeApi(TokenStore tokens) {
  final uri = Uri.tryParse(AppConfig.apiBaseUrl);
  if (uri == null ||
      !uri.hasScheme ||
      uri.host.isEmpty ||
      (uri.scheme != 'https' && uri.host != '10.0.2.2')) {
    throw const FormatException(
      'BUYME_API_BASE_URL must use HTTPS except for the Android emulator host',
    );
  }
  return Buyme.create(
    baseUrl: uri,
    interceptors: [AccessTokenInterceptor(tokens)],
  );
}
