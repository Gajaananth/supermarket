import '../../api/generated/buyme.swagger.dart';
import '../auth/token_store.dart';
import '../config/app_config.dart';
import 'access_token_interceptor.dart';

Buyme createBuymeApi(TokenStore tokens) {
  final uri = Uri.tryParse(AppConfig.apiBaseUrl);
  if (uri == null || !uri.hasScheme || uri.host.isEmpty) {
    throw const FormatException('BUYME_API_BASE_URL must be an absolute URL');
  }
  return Buyme.create(
    baseUrl: uri,
    interceptors: [AccessTokenInterceptor(tokens)],
  );
}
