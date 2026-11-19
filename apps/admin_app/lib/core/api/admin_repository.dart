import 'dart:async';
import 'dart:io';

import 'package:chopper/chopper.dart';
import 'package:http/http.dart' as http;

import '../../api/generated/buyme.enums.swagger.dart' as enums;
import '../../api/generated/buyme.swagger.dart';
import '../auth/token_store.dart';
import 'app_error.dart';

class AdminRepository {
  AdminRepository(this._api, this._tokens);

  final Buyme _api;
  final TokenStore _tokens;
  Future<void>? _refreshing;

  Future<JsonMap> adminLogin({
    required String email,
    required String password,
  }) async => jsonMap(
    await _request(
      () async => _api.apiV1AuthAdminLoginPost(
        body: AdminLoginDto(
          email: email.trim(),
          password: password,
          deviceId: await _tokens.deviceId(),
          deviceInfo: 'BuyMe Android Admin',
        ),
      ),
      retryUnauthorized: false,
    ),
    field: 'admin login',
  );

  Future<JsonMap> verify2fa({
    required String email,
    required String code,
  }) async => jsonMap(
    await _request(
      () async => _api.apiV1AuthAdminVerify2faPost(
        body: AdminVerify2faDto(
          email: email.trim(),
          code: code.trim(),
          deviceId: await _tokens.deviceId(),
          deviceInfo: 'BuyMe Android Admin',
        ),
      ),
      retryUnauthorized: false,
    ),
    field: 'two-factor verification',
  );

  Future<void> saveSessionTokens(JsonMap response) async {
    final accessToken = requiredString(response, 'accessToken');
    final refreshToken = requiredString(response, 'refreshToken');
    await _tokens.saveTokens(
      accessToken: accessToken,
      refreshToken: refreshToken,
    );
  }

  Future<JsonMap> profile() async {
    final response = jsonMap(
      await _request(_api.apiV1AuthMeGet),
      field: 'admin profile',
    );
    return jsonMap(response['user'], field: 'admin profile user');
  }

  Future<List<JsonMap>> storesForSuperAdmin() async =>
      jsonMaps(await _request(_api.apiV1StoresAdminGet), field: 'admin stores');

  Future<List<JsonMap>> orders({String? storeId}) async => jsonMaps(
    await _request(() => _api.apiV1OrdersGet(limit: 100, storeId: storeId)),
    field: 'orders',
  );

  Future<List<JsonMap>> eligibleRiders() async => jsonMaps(
    await _request(_api.apiV1OrdersEligibleRidersGet),
    field: 'eligible riders',
  );

  Future<void> updateOrder(
    String id,
    String action, {
    String? reason,
    String? riderId,
  }) async {
    final result = switch (action) {
      'accept' => _api.apiV1OrdersIdAcceptPost(
        id: id,
        body: const OrderNoteDto(note: 'Accepted by admin'),
      ),
      'reject' => _api.apiV1OrdersIdRejectPost(
        id: id,
        body: OrderReasonDto(reason: _required(reason, 'rejection reason')),
      ),
      'preparing' => _api.apiV1OrdersIdPreparingPost(
        id: id,
        body: const OrderNoteDto(note: 'Preparation started'),
      ),
      'ready' => _api.apiV1OrdersIdReadyPost(
        id: id,
        body: const OrderNoteDto(note: 'Order is ready for pickup'),
      ),
      'assign-rider' => _api.apiV1OrdersIdAssignRiderPost(
        id: id,
        body: AssignOrderRiderDto(riderId: _required(riderId, 'rider')),
      ),
      _ => throw ArgumentError.value(
        action,
        'action',
        'Unsupported order action',
      ),
    };
    await _request(() => result);
  }

  Future<List<JsonMap>> storeStock(String storeId) async => jsonMaps(
    await _request(() => _api.apiV1StoresStoreIdStockGet(storeId: storeId)),
    field: 'store stock',
  );

  Future<List<JsonMap>> storeAlerts(String storeId) async => jsonMaps(
    await _request(() => _api.apiV1StoresStoreIdAlertsGet(storeId: storeId)),
    field: 'store stock alerts',
  );

  Future<void> adjustStoreStock({
    required String storeId,
    required String productId,
    required double quantityDelta,
    required String reason,
  }) async {
    await _request(
      () => _api.apiV1StoresStoreIdStockProductIdAdjustPost(
        storeId: storeId,
        productId: productId,
        body: AdjustStockDto(
          quantityDelta: quantityDelta,
          reason: reason.trim(),
        ),
      ),
    );
  }

  Future<void> acknowledgeStoreAlert({
    required String storeId,
    required String alertId,
  }) async {
    await _request(
      () => _api.apiV1StoresStoreIdAlertsAlertIdAcknowledgePatch(
        storeId: storeId,
        alertId: alertId,
      ),
    );
  }

  Future<List<JsonMap>> transfers({String? storeId}) async => jsonMaps(
    await _request(() => _api.apiV1TransfersGet(storeId: storeId)),
    field: 'stock transfers',
  );

  Future<void> createTransfer({
    required String storeId,
    required List<TransferLineDto> items,
  }) async {
    await _request(
      () => _api.apiV1TransfersPost(
        body: CreateTransferDto(storeId: storeId, items: items),
      ),
    );
  }

  Future<void> dispatchTransfer(String id) async {
    await _request(() => _api.apiV1TransfersIdDispatchPost(id: id));
  }

  Future<void> cancelTransfer(String id) async {
    await _request(() => _api.apiV1TransfersIdCancelPost(id: id));
  }

  Future<void> revertTransfer(String id) async {
    await _request(() => _api.apiV1TransfersIdRevertPost(id: id));
  }

  Future<void> resolveTransfer({
    required String id,
    required String resolutionNote,
    required List<ResolveTransferLineDto> items,
  }) async {
    await _request(
      () => _api.apiV1TransfersIdResolvePost(
        id: id,
        body: ResolveTransferDto(
          resolutionNote: resolutionNote.trim(),
          items: items,
        ),
      ),
    );
  }

  Future<void> receiveTransfer({
    required String id,
    required List<ReceiveTransferLineDto> items,
  }) async {
    await _request(
      () => _api.apiV1TransfersIdReceivePost(
        id: id,
        body: ReceiveTransferDto(items: items),
      ),
    );
  }

  Future<List<JsonMap>> depositQueue({String? storeId}) async => jsonMaps(
    await _request(
      () => _api.apiV1CashControlDepositsVerificationQueueGet(
        storeId: storeId,
        limit: 100,
      ),
    ),
    field: 'deposit verification queue',
  );

  Future<void> verifyDeposit({
    required String id,
    required enums.VerifyRiderDepositDtoAction action,
    String? rejectionReason,
    double? receivedAmount,
    String? varianceReason,
  }) async {
    await _request(
      () => _api.apiV1CashControlDepositsIdVerifyPost(
        id: id,
        body: VerifyRiderDepositDto(
          action: action,
          rejectionReason: rejectionReason,
          receivedAmount: receivedAmount,
          varianceReason: varianceReason,
        ),
      ),
    );
  }

  Future<void> resolveDepositVariance({
    required String id,
    required enums.ResolveDepositVarianceDtoAction action,
    required String resolutionNote,
  }) async {
    await _request(
      () => _api.apiV1CashControlDepositsIdVarianceResolvePost(
        id: id,
        body: ResolveDepositVarianceDto(
          action: action,
          resolutionNote: resolutionNote.trim(),
        ),
      ),
    );
  }

  Future<String> depositSlipUrl(String id) async {
    final response = jsonMap(
      await _request(() => _api.apiV1CashControlDepositsIdSlipUrlGet(id: id)),
      field: 'deposit slip link',
    );
    return requiredString(response, 'url');
  }

  Future<JsonMap> reportOverview({
    required String from,
    required String to,
    String? storeId,
  }) async => jsonMap(
    await _request(
      () => _api.apiV1ReportsOverviewGet(from: from, to: to, storeId: storeId),
    ),
    field: 'report overview',
  );

  Future<JsonMap> riderReviewQueue() async => jsonMap(
    await _request(() => _api.apiV1RidersReviewQueueGet(page: 1, pageSize: 50)),
    field: 'rider KYC review queue',
  );

  Future<JsonMap> riderReviewDetails(String riderId) async => jsonMap(
    await _request(
      () => _api.apiV1RidersReviewQueueRiderIdGet(riderId: riderId),
    ),
    field: 'rider KYC details',
  );

  Future<String> riderDocumentUrl({
    required String riderId,
    required String documentType,
  }) async {
    final response = jsonMap(
      await _request(
        () => _api.apiV1RidersRiderIdKycDocumentTypeUrlGet(
          riderId: riderId,
          documentType: documentType,
        ),
      ),
      field: 'rider KYC document link',
    );
    return requiredString(response, 'url');
  }

  Future<void> approveRider({
    required String riderId,
    required String storeId,
    required enums.ApproveRiderKycDtoRiderType riderType,
  }) async {
    await _request(
      () => _api.apiV1RidersRiderIdApprovePost(
        riderId: riderId,
        body: ApproveRiderKycDto(storeId: storeId, riderType: riderType),
      ),
    );
  }

  Future<void> rejectRider({
    required String riderId,
    required String reason,
  }) async {
    await _request(
      () => _api.apiV1RidersRiderIdRejectPost(
        riderId: riderId,
        body: RejectRiderKycDto(reason: reason.trim()),
      ),
    );
  }

  Future<void> suspendRider({
    required String riderId,
    required String reason,
  }) async {
    await _request(
      () => _api.apiV1RidersRiderIdSuspendPost(
        riderId: riderId,
        body: SuspendRiderDto(reason: reason.trim()),
      ),
    );
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
    await _tokens.clearTokens();
  }

  Future<Object?> _request(
    Future<Response> Function() call, {
    bool retryUnauthorized = true,
  }) async {
    final response = await _call(call);
    if (response.statusCode == 401 && retryUnauthorized) {
      await _refreshSession();
      return readResponse(await _call(call));
    }
    return readResponse(response);
  }

  Future<Response> _call(Future<Response> Function() call) async {
    try {
      return await call();
    } on SocketException catch (error) {
      throw AdminApiException(
        'Could not reach the BuyMe API: ${error.message}',
      );
    } on http.ClientException catch (error) {
      throw AdminApiException(
        'Could not reach the BuyMe API: ${error.message}',
      );
    } on TimeoutException {
      throw const AdminApiException('The BuyMe API request timed out.');
    }
  }

  Future<void> _refreshSession() async {
    final pending = _refreshing;
    if (pending != null) return pending;
    final operation = Future<void>.sync(() async {
      final refreshToken = await _tokens.readRefreshToken();
      if (refreshToken == null || refreshToken.isEmpty) {
        await _tokens.clearTokens();
        throw const AdminApiException(
          'Your session expired. Please sign in again.',
        );
      }
      final response = await _call(
        () async => _api.apiV1AuthRefreshPost(
          body: RefreshTokenDto(
            refreshToken: refreshToken,
            deviceId: await _tokens.deviceId(),
          ),
        ),
      );
      if (!response.isSuccessful) {
        if (response.statusCode == 401) await _tokens.clearTokens();
        readResponse(response);
      }
      final result = jsonMap(
        readResponse(response),
        field: 'refreshed session',
      );
      await saveSessionTokens(result);
    });
    _refreshing = operation;
    try {
      await operation;
    } finally {
      _refreshing = null;
    }
  }

  String _required(String? value, String field) {
    if (value == null || value.trim().isEmpty) {
      throw FormatException('Choose a $field before continuing');
    }
    return value;
  }
}
