import 'package:chopper/chopper.dart';

import '../../api/generated/buyme.swagger.dart';
import '../auth/phone_number.dart';
import '../auth/token_store.dart';
import 'api_models.dart';
import 'app_error.dart';

class CustomerRepository {
  CustomerRepository(
    this._api,
    this._tokens, {
    void Function()? onSessionExpired,
  }) : _onSessionExpired = onSessionExpired;

  final Buyme _api;
  final TokenStore _tokens;
  final void Function()? _onSessionExpired;
  Future<void>? _refreshInProgress;

  Future<String?> requestOtp(String phone) async {
    final response = await _request(
      () => _api.apiV1AuthCustomerOtpRequestPost(
        body: RequestCustomerOtpDto(phone: phone),
      ),
    );
    final data = jsonMap(response, field: 'OTP request');
    final demoCode = data['demoCode'];
    return demoCode is String ? demoCode : null;
  }

  Future<void> verifyOtp({required String phone, required String code}) async {
    final deviceId = await _tokens.deviceId();
    final response = await _request(
      () => _api.apiV1AuthCustomerOtpVerifyPost(
        body: VerifyCustomerOtpDto(
          phone: phone,
          code: code,
          deviceId: deviceId,
          deviceInfo: 'BuyMe Android customer app',
        ),
      ),
      retryUnauthorized: false,
    );
    final data = jsonMap(response, field: 'OTP verification');
    final access = requiredString(data, 'accessToken');
    final refresh = requiredString(data, 'refreshToken');
    await _tokens.saveTokens(accessToken: access, refreshToken: refresh);
  }

  Future<void> registerPushToken(String pushToken) async {
    await _request(
      () async => _api.apiV1AuthPushTokenPost(
        body: RegisterPushTokenDto(
          deviceId: await _tokens.deviceId(),
          pushToken: pushToken,
        ),
      ),
    );
  }

  Future<Store> nearestStore({
    required double latitude,
    required double longitude,
  }) async {
    final value = jsonMap(
      await _request(
        () => _api.apiV1StoresFindNearestPost(
          body: FindNearestStoreDto(latitude: latitude, longitude: longitude),
        ),
      ),
      field: 'nearest store',
    );
    return Store.fromJson(
      jsonMap(value['store'], field: 'nearest store details'),
      distanceKm: requiredNumber(value, 'distanceKm'),
    );
  }

  Future<Store> store(String id) async {
    final value = jsonMap(
      await _request(() => _api.apiV1StoresIdGet(id: id)),
      field: 'store details',
    );
    return Store.fromJson(value);
  }

  Future<String> reverseGeocode({
    required double latitude,
    required double longitude,
  }) async {
    final data = jsonMap(
      await _request(
        () => _api.apiV1MapsReverseGeocodeGet(
          latitude: latitude,
          longitude: longitude,
        ),
      ),
      field: 'reverse geocoding result',
    );
    return requiredString(data, 'displayName');
  }

  Future<JsonMap> geocode(String query) async {
    return jsonMap(
      await _request(() => _api.apiV1MapsGeocodeGet(q: query)),
      field: 'geocoding result',
    );
  }

  Future<List<CatalogProduct>> catalog(String storeId, {String? query}) async {
    final values = jsonList(
      await _request(
        () => _api.apiV1StoresStoreIdCatalogGet(storeId: storeId, query: query),
      ),
      field: 'store catalogue',
    );
    return values
        .map((item) => CatalogProduct.fromJson(jsonMap(item, field: 'product')))
        .toList(growable: false);
  }

  Future<List<ProductCategory>> categories() async {
    final values = jsonList(
      await _request(_api.apiV1CategoriesGet),
      field: 'product categories',
    );
    return values
        .map(
          (item) => ProductCategory.fromJson(
            jsonMap(item, field: 'product category'),
          ),
        )
        .toList(growable: false);
  }

  Future<List<CartItem>> cart(String storeId) async {
    final data = jsonMap(
      await _request(() => _api.apiV1CartStoreIdGet(storeId: storeId)),
      field: 'cart',
    );
    return jsonList(data['items'], field: 'cart items')
        .map((item) => CartItem.fromJson(jsonMap(item, field: 'cart item')))
        .toList(growable: false);
  }

  Future<void> addToCart({
    required String storeId,
    required String storeProductId,
    required int quantity,
  }) async {
    await _request(
      () => _api.apiV1CartStoreIdItemsPost(
        storeId: storeId,
        body: CartItemInputDto(
          storeProductId: storeProductId,
          quantity: quantity.toDouble(),
        ),
      ),
    );
  }

  Future<void> setCartQuantity({
    required String storeId,
    required String storeProductId,
    required int quantity,
  }) async {
    await _request(
      () => _api.apiV1CartStoreIdItemsStoreProductIdPatch(
        storeId: storeId,
        storeProductId: storeProductId,
        body: CartItemQuantityDto(quantity: quantity.toDouble()),
      ),
    );
  }

  Future<void> removeFromCart({
    required String storeId,
    required String storeProductId,
  }) async {
    await _request(
      () => _api.apiV1CartStoreIdItemsStoreProductIdDelete(
        storeId: storeId,
        storeProductId: storeProductId,
      ),
    );
  }

  Future<List<DeliveryAddress>> addresses() async {
    final values = jsonList(
      await _request(_api.apiV1AddressesGet),
      field: 'delivery addresses',
    );
    return values
        .map(
          (item) => DeliveryAddress.fromJson(
            jsonMap(item, field: 'delivery address'),
          ),
        )
        .toList(growable: false);
  }

  Future<JsonMap> profile() async {
    return jsonMap(
      await _request(_api.apiV1AuthMeGet),
      field: 'customer profile',
    );
  }

  Future<String> refreshAccessTokenForSocket() async {
    await _refreshSession();
    final token = await _tokens.readAccessToken();
    if (token == null || token.isEmpty) {
      throw const AppError('Your session has expired. Please sign in again.');
    }
    return token;
  }

  Future<DeliveryAddress> createAddress({
    required String label,
    required String recipientName,
    required String recipientPhone,
    required String streetAddress,
    required String locality,
    required double latitude,
    required double longitude,
    String? landmark,
    bool isDefault = false,
  }) async {
    final data = await _request(
      () => _api.apiV1AddressesPost(
        body: CreateAddressDto(
          label: label,
          recipientName: recipientName,
          recipientPhone: normalizeSriLankanPhone(recipientPhone),
          streetAddress: streetAddress,
          locality: locality,
          latitude: latitude,
          longitude: longitude,
          landmark: landmark,
          isDefault: isDefault,
        ),
      ),
    );
    return DeliveryAddress.fromJson(jsonMap(data, field: 'new address'));
  }

  Future<CustomerOrder> checkout({
    required String storeId,
    required String addressId,
    List<String> campaignCodes = const [],
  }) async {
    final data = await _request(
      () => _api.apiV1OrdersCheckoutPost(
        body: CheckoutOrderDto(
          storeId: storeId,
          deliveryAddressId: addressId,
          campaignCodes: campaignCodes,
        ),
      ),
    );
    return CustomerOrder.fromJson(jsonMap(data, field: 'created order'));
  }

  Future<List<CustomerOrder>> orders() async {
    final values = jsonList(
      await _request(() => _api.apiV1OrdersGet(limit: 50)),
      field: 'orders',
    );
    return values
        .map((item) => CustomerOrder.fromJson(jsonMap(item, field: 'order')))
        .toList(growable: false);
  }

  Future<CustomerOrder> order(String id) async {
    return CustomerOrder.fromJson(
      jsonMap(
        await _request(() => _api.apiV1OrdersIdGet(id: id)),
        field: 'order details',
      ),
    );
  }

  Future<void> cancelOrder(String id, String reason) async {
    await _request(
      () => _api.apiV1OrdersIdCancelPost(
        id: id,
        body: OrderReasonDto(reason: reason),
      ),
    );
  }

  Future<void> deleteAddress(String id) async {
    await _request(() => _api.apiV1AddressesIdDelete(id: id));
  }

  Future<List<LatLngPoint>> route({
    required double fromLatitude,
    required double fromLongitude,
    required double toLatitude,
    required double toLongitude,
  }) async {
    final data = jsonMap(
      await _request(
        () => _api.apiV1MapsRouteGet(
          fromLatitude: fromLatitude,
          fromLongitude: fromLongitude,
          toLatitude: toLatitude,
          toLongitude: toLongitude,
        ),
      ),
      field: 'route',
    );
    return jsonList(data['coordinates'], field: 'route coordinates')
        .map((coordinate) {
          final values = jsonList(coordinate, field: 'route coordinate');
          if (values.length < 2 || values[0] is! num || values[1] is! num) {
            throw const FormatException(
              'The map route contains an invalid point',
            );
          }
          return LatLngPoint(
            latitude: (values[1] as num).toDouble(),
            longitude: (values[0] as num).toDouble(),
          );
        })
        .toList(growable: false);
  }

  Future<void> logout() async {
    final refreshToken = await _tokens.readRefreshToken();
    if (refreshToken != null) {
      await _request(
        () async => _api.apiV1AuthLogoutPost(
          body: RefreshTokenDto(
            refreshToken: refreshToken,
            deviceId: await _tokens.deviceId(),
          ),
        ),
        retryUnauthorized: false,
      );
    }
    await _tokens.clear();
  }

  Future<Object?> _request(
    Future<Response> Function() call, {
    bool retryUnauthorized = true,
  }) async {
    final response = await call();
    if (response.statusCode == 401 && retryUnauthorized) {
      await _refreshSession();
      final retried = await call();
      return _readResponse(retried);
    }
    return _readResponse(response);
  }

  Object? _readResponse(Response response) {
    if (!response.isSuccessful) {
      throw AppError(_message(response.body), statusCode: response.statusCode);
    }
    final body = response.body;
    if (body is Map && body.containsKey('data')) return body['data'];
    return body;
  }

  String _message(Object? body) {
    if (body is Map) {
      final message = body['message'];
      if (message is String && message.isNotEmpty) return message;
      if (message is List) return message.map((entry) => '$entry').join(', ');
    }
    return 'The request failed. Please try again.';
  }

  Future<void> _refreshSession() async {
    final pending = _refreshInProgress;
    if (pending != null) return pending;
    final completer = Future<void>.sync(() async {
      final refreshToken = await _tokens.readRefreshToken();
      if (refreshToken == null || refreshToken.isEmpty) {
        throw const AppError('Your session has expired. Please sign in again.');
      }
      final response = await _api.apiV1AuthRefreshPost(
        body: RefreshTokenDto(
          refreshToken: refreshToken,
          deviceId: await _tokens.deviceId(),
        ),
      );
      if (!response.isSuccessful) {
        await _tokens.clear();
        throw AppError(
          _message(response.body),
          statusCode: response.statusCode,
        );
      }
      final body = response.body;
      final envelope = jsonMap(body, field: 'refreshed session');
      final data = jsonMap(envelope['data'], field: 'refreshed session data');
      await _tokens.saveTokens(
        accessToken: requiredString(data, 'accessToken'),
        refreshToken: requiredString(data, 'refreshToken'),
      );
    });
    _refreshInProgress = completer;
    try {
      await completer;
    } catch (_) {
      await _tokens.clear();
      _onSessionExpired?.call();
      rethrow;
    } finally {
      _refreshInProgress = null;
    }
  }
}
