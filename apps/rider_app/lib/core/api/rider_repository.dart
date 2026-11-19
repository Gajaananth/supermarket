import 'dart:async';
import 'package:chopper/chopper.dart';
import 'package:http/http.dart' as http;

import '../../api/generated/buyme.enums.swagger.dart' as enums;
import '../../api/generated/buyme.swagger.dart';
import '../auth/token_store.dart';
import 'app_error.dart';
import 'rider_models.dart';

class RiderRepository {
  RiderRepository(this._api, this._tokens);

  final Buyme _api;
  final TokenStore _tokens;
  Future<void>? _refreshing;

  Future<String?> requestOtp(String destination) async {
    final response = await _request(
      () => _api.apiV1AuthRiderOtpRequestPost(
        body: RequestRiderOtpDto(destination: destination.trim()),
      ),
    );
    final data = jsonMap(response, field: 'OTP request');
    final demoCode = data['demoCode'];
    return demoCode is String ? demoCode : null;
  }

  Future<void> verifyOtp({
    required String destination,
    required String code,
  }) async {
    final response = await _request(
      () async => _api.apiV1AuthRiderOtpVerifyPost(
        body: VerifyRiderOtpDto(
          destination: destination.trim(),
          code: code.trim(),
          deviceId: await _tokens.deviceId(),
          deviceInfo: 'BuyMe Android Rider',
        ),
      ),
      retryUnauthorized: false,
    );
    final data = jsonMap(response, field: 'OTP verification');
    await _tokens.saveTokens(
      accessToken: _requiredString(data, 'accessToken'),
      refreshToken: _requiredString(data, 'refreshToken'),
    );
  }

  Future<JsonMap> profile() async =>
      jsonMap(await _request(_api.apiV1AuthMeGet), field: 'rider profile');

  Future<JsonMap> kycStatus() async =>
      jsonMap(await _request(_api.apiV1RidersMeKycGet), field: 'KYC status');

  Future<void> startShift() async {
    await _request(_api.apiV1RidersMeShiftStartPost);
  }

  Future<void> stopShift() async {
    await _request(_api.apiV1RidersMeShiftStopPost);
  }

  Future<JsonMap> createKycUploadUrl(String contentType, int length) async {
    final content = switch (contentType) {
      'image/jpeg' => enums.KycUploadUrlDtoContentType.imageJpeg,
      'image/png' => enums.KycUploadUrlDtoContentType.imagePng,
      'image/webp' => enums.KycUploadUrlDtoContentType.imageWebp,
      _ => throw const AppError('Choose a JPEG, PNG, or WebP image.'),
    };
    return jsonMap(
      await _request(
        () => _api.apiV1RidersMeKycUploadUrlPost(
          body: KycUploadUrlDto(
            contentType: content,
            contentLength: length.toDouble(),
          ),
        ),
      ),
      field: 'KYC upload URL',
    );
  }

  Future<JsonMap> submitKyc({
    required String bikeNumber,
    required String drivingKey,
    required String vehicleKey,
  }) async => jsonMap(
    await _request(
      () => _api.apiV1RidersMeKycSubmitPost(
        body: SubmitRiderKycDto(
          bikeNumber: bikeNumber.trim(),
          drivingLicenceObjectKey: drivingKey,
          vehicleLicenceObjectKey: vehicleKey,
        ),
      ),
    ),
    field: 'KYC submission',
  );

  Future<List<RiderOrder>> orders() async {
    final values = await _request(() => _api.apiV1OrdersGet(limit: 100));
    return jsonMaps(
      values,
      field: 'assigned orders',
    ).map(RiderOrder.new).toList(growable: false);
  }

  Future<JsonMap> order(String id) async => jsonMap(
    await _request(() => _api.apiV1OrdersIdGet(id: id)),
    field: 'order details',
  );

  Future<RiderCash> cash() async => RiderCash.fromJson(
    jsonMap(
      await _request(_api.apiV1CashControlMeGet),
      field: 'rider cash balance',
    ),
  );

  Future<List<JsonMap>> deposits() async => jsonMaps(
    await _request(() => _api.apiV1CashControlDepositsGet(limit: 50)),
    field: 'deposit history',
  );

  Future<JsonMap> createDepositUploadUrl(String contentType, int length) async {
    final content = switch (contentType) {
      'image/jpeg' => enums.DepositUploadUrlDtoContentType.imageJpeg,
      'image/png' => enums.DepositUploadUrlDtoContentType.imagePng,
      'application/pdf' => enums.DepositUploadUrlDtoContentType.applicationPdf,
      _ => throw const AppError('Choose a JPEG, PNG, or PDF bank slip.'),
    };
    return jsonMap(
      await _request(
        () => _api.apiV1CashControlDepositsUploadUrlPost(
          body: DepositUploadUrlDto(
            contentType: content,
            contentLength: length.toDouble(),
          ),
        ),
      ),
      field: 'deposit upload URL',
    );
  }

  Future<JsonMap> submitDeposit({
    required double amount,
    required String bankReference,
    required String objectKey,
  }) async => jsonMap(
    await _request(
      () => _api.apiV1CashControlDepositsPost(
        body: CreateRiderDepositDto(
          amount: amount,
          bankRefNumber: bankReference.trim(),
          objectKey: objectKey,
        ),
      ),
    ),
    field: 'deposit submission',
  );

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
    final coordinates = data['coordinates'];
    if (coordinates is! List) throw const FormatException('Invalid route data');
    return coordinates
        .map((point) {
          if (point is! List ||
              point.length < 2 ||
              point[0] is! num ||
              point[1] is! num) {
            throw const FormatException('Invalid route coordinate');
          }
          return LatLngPoint(
            latitude: (point[1] as num).toDouble(),
            longitude: (point[0] as num).toDouble(),
          );
        })
        .toList(growable: false);
  }

  Future<void> pickUp(String id) async => _request(
    () => _api.apiV1OrdersIdPickUpPost(id: id, body: const OrderNoteDto()),
  );

  Future<void> startDelivery(String id) async => _request(
    () =>
        _api.apiV1OrdersIdStartDeliveryPost(id: id, body: const OrderNoteDto()),
  );

  Future<void> deliver(String id, double collectedAmount) async => _request(
    () => _api.apiV1OrdersIdDeliverPost(
      id: id,
      body: DeliverOrderDto(collectedAmount: collectedAmount),
    ),
  );

  Future<void> reject(String id, String reason) async => _request(
    () => _api.apiV1OrdersIdRiderRejectPost(
      id: id,
      body: OrderReasonDto(reason: reason),
    ),
  );

  Future<void> fail(String id, String reason) async => _request(
    () => _api.apiV1OrdersIdFailPost(
      id: id,
      body: OrderReasonDto(reason: reason),
    ),
  );

  Future<void> uploadSignedFile({
    required String uploadUrl,
    required String contentType,
    required List<int> bytes,
  }) async {
    final uri = Uri.tryParse(uploadUrl);
    if (uri == null || uri.scheme != 'https') {
      throw const AppError('The private upload URL is invalid.');
    }
    final response = await http.put(
      uri,
      headers: {
        'Content-Type': contentType,
        'Content-Length': '${bytes.length}',
      },
      body: bytes,
    );
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw AppError('Private file upload failed (${response.statusCode}).');
    }
  }

  Future<void> registerPushToken(String token) async {
    await _request(
      () async => _api.apiV1AuthPushTokenPost(
        body: RegisterPushTokenDto(
          deviceId: await _tokens.deviceId(),
          pushToken: token,
        ),
      ),
    );
  }

  Future<String> accessTokenForSocket() async {
    await _refreshSession();
    final token = await _tokens.readAccessToken();
    if (token == null || token.isEmpty) {
      throw const AppError('Your session has expired. Please sign in again.');
    }
    return token;
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
      return _readResponse(await call());
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
      if (message is List) return message.join(', ');
    }
    return 'The request failed. Please try again.';
  }

  Future<void> _refreshSession() async {
    final pending = _refreshing;
    if (pending != null) return pending;
    final operation = Future<void>.sync(() async {
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
      final envelope = jsonMap(response.body, field: 'refreshed session');
      final data = jsonMap(envelope['data'], field: 'refreshed session data');
      await _tokens.saveTokens(
        accessToken: _requiredString(data, 'accessToken'),
        refreshToken: _requiredString(data, 'refreshToken'),
      );
    });
    _refreshing = operation;
    try {
      await operation;
    } catch (_) {
      await _tokens.clear();
      rethrow;
    } finally {
      _refreshing = null;
    }
  }

  String _requiredString(JsonMap value, String key) {
    final result = value[key];
    if (result is! String || result.isEmpty) {
      throw FormatException('The authentication response is missing $key');
    }
    return result;
  }
}
