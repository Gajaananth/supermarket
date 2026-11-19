// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format width=80

part of 'buyme.swagger.dart';

// **************************************************************************
// ChopperGenerator
// **************************************************************************

// coverage:ignore-file
// ignore_for_file: type=lint
final class _$Buyme extends Buyme {
  _$Buyme([ChopperClient? client]) {
    if (client == null) return;
    this.client = client;
  }

  @override
  final Type definitionType = Buyme;

  @override
  Future<Response<dynamic>> _apiV1AuthCustomerOtpRequestPost({
    required RequestCustomerOtpDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Request Customer OTP login code (Phone only)',
      operationId: 'AuthController_requestCustomerOtp',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Authentication & Identity"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/auth/customer/otp-request');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1AuthCustomerOtpVerifyPost({
    required VerifyCustomerOtpDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Verify Customer OTP & issue access + rotating refresh tokens',
      operationId: 'AuthController_verifyCustomerOtp',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Authentication & Identity"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/auth/customer/otp-verify');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1AuthRiderOtpRequestPost({
    required RequestRiderOtpDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Request Rider OTP login code (Phone or Email)',
      operationId: 'AuthController_requestRiderOtp',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Authentication & Identity"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/auth/rider/otp-request');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1AuthRiderOtpVerifyPost({
    required VerifyRiderOtpDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Verify Rider OTP & authenticate',
      operationId: 'AuthController_verifyRiderOtp',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Authentication & Identity"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/auth/rider/otp-verify');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1AuthRiderRegistrationOtpRequestPost({
    required RequestRiderRegistrationOtpDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Request an OTP to register a rider account',
      operationId: 'AuthController_requestRiderRegistrationOtp',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Authentication & Identity"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/auth/rider/registration/otp-request');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1AuthRiderRegistrationOtpVerifyPost({
    required VerifyRiderRegistrationOtpDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Verify registration OTP and create a pending rider account',
      operationId: 'AuthController_verifyRiderRegistrationOtp',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Authentication & Identity"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/auth/rider/registration/otp-verify');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1AuthAdminLoginPost({
    required AdminLoginDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary:
          'Admin login by Email + Argon2 Password (Optional 2FA for Super Admin)',
      operationId: 'AuthController_adminLogin',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Authentication & Identity"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/auth/admin/login');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1AuthAdminVerify2faPost({
    required AdminVerify2faDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Verify Super Admin 2FA OTP code',
      operationId: 'AuthController_verifyAdmin2fa',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Authentication & Identity"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/auth/admin/verify-2fa');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1AuthRefreshPost({
    required RefreshTokenDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Rotate refresh token (Replay attack detection & revocation)',
      operationId: 'AuthController_refresh',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Authentication & Identity"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/auth/refresh');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1AuthLogoutPost({
    required RefreshTokenDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Logout and revoke device refresh session',
      operationId: 'AuthController_logout',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Authentication & Identity"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/auth/logout');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1AuthLogoutAllPost({
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Revoke all active sessions for the authenticated account',
      operationId: 'AuthController_logoutAll',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Authentication & Identity"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/auth/logout-all');
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1AuthPushTokenPost({
    required RegisterPushTokenDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Register an FCM token for an active signed-in device',
      operationId: 'AuthController_registerPushToken',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Authentication & Identity"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/auth/push-token');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1AuthMeGet({
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Get current authenticated user profile',
      operationId: 'AuthController_getProfile',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Authentication & Identity"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/auth/me');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1OrdersPost({
    required CreateOrderDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'OrdersController_create',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Orders & COD"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/orders');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1OrdersGet({
    String? status,
    String? storeId,
    num? limit,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'OrdersController_list',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Orders & COD"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/orders');
    final Map<String, dynamic> $params = <String, dynamic>{
      'status': status,
      'storeId': storeId,
      'limit': limit,
    };
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      parameters: $params,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1OrdersCheckoutPost({
    required CheckoutOrderDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'OrdersController_checkout',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Orders & COD"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/orders/checkout');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1OrdersEligibleRidersGet({
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'OrdersController_eligibleRiders',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Orders & COD"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/orders/eligible-riders');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1OrdersIdGet({
    required String? id,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'OrdersController_findOne',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Orders & COD"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/orders/${id}');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1OrdersIdCancelPost({
    required String? id,
    required OrderReasonDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'OrdersController_cancel',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Orders & COD"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/orders/${id}/cancel');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1OrdersIdAcceptPost({
    required String? id,
    required OrderNoteDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'OrdersController_accept',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Orders & COD"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/orders/${id}/accept');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1OrdersIdRejectPost({
    required String? id,
    required OrderReasonDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'OrdersController_reject',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Orders & COD"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/orders/${id}/reject');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1OrdersIdPreparingPost({
    required String? id,
    required OrderNoteDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'OrdersController_startPreparing',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Orders & COD"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/orders/${id}/preparing');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1OrdersIdReadyPost({
    required String? id,
    required OrderNoteDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'OrdersController_markReady',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Orders & COD"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/orders/${id}/ready');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1OrdersIdAssignRiderPost({
    required String? id,
    required AssignOrderRiderDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'OrdersController_assignRider',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Orders & COD"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/orders/${id}/assign-rider');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1OrdersIdRiderRejectPost({
    required String? id,
    required OrderReasonDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'OrdersController_riderReject',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Orders & COD"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/orders/${id}/rider-reject');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1OrdersIdPickUpPost({
    required String? id,
    required OrderNoteDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'OrdersController_pickUp',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Orders & COD"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/orders/${id}/pick-up');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1OrdersIdStartDeliveryPost({
    required String? id,
    required OrderNoteDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'OrdersController_startDelivery',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Orders & COD"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/orders/${id}/start-delivery');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1OrdersIdDeliverPost({
    required String? id,
    required DeliverOrderDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'OrdersController_deliver',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Orders & COD"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/orders/${id}/deliver');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1OrdersIdFailPost({
    required String? id,
    required OrderReasonDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'OrdersController_fail',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Orders & COD"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/orders/${id}/fail');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1CashControlMeGet({
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CashControlController_getMyCash',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Cash Control"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/cash-control/me');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1CashControlDepositsUploadUrlPost({
    required DepositUploadUrlDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CashControlController_createUploadUrl',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Cash Control"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/cash-control/deposits/upload-url');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1CashControlDepositsPost({
    required CreateRiderDepositDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CashControlController_submit',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Cash Control"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/cash-control/deposits');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1CashControlDepositsGet({
    String? status,
    String? storeId,
    String? riderId,
    num? limit,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CashControlController_list',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Cash Control"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/cash-control/deposits');
    final Map<String, dynamic> $params = <String, dynamic>{
      'status': status,
      'storeId': storeId,
      'riderId': riderId,
      'limit': limit,
    };
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      parameters: $params,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1CashControlDepositsVerificationQueueGet({
    String? status,
    String? storeId,
    String? riderId,
    num? limit,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CashControlController_verificationQueue',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Cash Control"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse(
      '/api/v1/cash-control/deposits/verification-queue',
    );
    final Map<String, dynamic> $params = <String, dynamic>{
      'status': status,
      'storeId': storeId,
      'riderId': riderId,
      'limit': limit,
    };
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      parameters: $params,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1CashControlDepositsVarianceCasesGet({
    String? status,
    String? storeId,
    num? limit,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CashControlController_varianceCases',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Cash Control"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/cash-control/deposits/variance-cases');
    final Map<String, dynamic> $params = <String, dynamic>{
      'status': status,
      'storeId': storeId,
      'limit': limit,
    };
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      parameters: $params,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1CashControlStoresStoreIdReconciliationGet({
    required String? storeId,
    required String? date,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CashControlController_storeReconciliation',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Cash Control"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse(
      '/api/v1/cash-control/stores/${storeId}/reconciliation',
    );
    final Map<String, dynamic> $params = <String, dynamic>{'date': date};
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      parameters: $params,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1CashControlDepositsIdSlipUrlGet({
    required String? id,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CashControlController_createDownloadUrl',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Cash Control"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/cash-control/deposits/${id}/slip-url');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1CashControlDepositsIdVerifyPost({
    required String? id,
    required VerifyRiderDepositDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CashControlController_verify',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Cash Control"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/cash-control/deposits/${id}/verify');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1CashControlDepositsIdVarianceResolvePost({
    required String? id,
    required ResolveDepositVarianceDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CashControlController_resolveVariance',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Cash Control"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse(
      '/api/v1/cash-control/deposits/${id}/variance/resolve',
    );
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1RidersMeShiftStartPost({
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Start a shift for an approved rider with no cash restriction',
      operationId: 'RiderOnboardingController_startShift',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Registration & KYC"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/riders/me/shift/start');
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1RidersMeShiftStopPost({
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Stop a shift when no active delivery is assigned',
      operationId: 'RiderOnboardingController_stopShift',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Registration & KYC"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/riders/me/shift/stop');
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1RidersMeKycGet({
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Get the authenticated rider KYC status',
      operationId: 'RiderOnboardingController_getMyStatus',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Registration & KYC"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/riders/me/kyc');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1RidersMeKycUploadUrlPost({
    required KycUploadUrlDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Create a short-lived private URL for a KYC image upload',
      operationId: 'RiderOnboardingController_createUploadUrl',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Registration & KYC"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/riders/me/kyc/upload-url');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1RidersMeKycSubmitPost({
    required SubmitRiderKycDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Submit or resubmit bike details and scanned licence images',
      operationId: 'RiderOnboardingController_submitKyc',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Registration & KYC"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/riders/me/kyc/submit');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1RidersReviewQueueGet({
    num? page,
    num? pageSize,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'List riders awaiting KYC review',
      operationId: 'RiderOnboardingController_reviewQueue',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Registration & KYC"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/riders/review-queue');
    final Map<String, dynamic> $params = <String, dynamic>{
      'page': page,
      'pageSize': pageSize,
    };
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      parameters: $params,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1RidersReviewQueueRiderIdGet({
    required String? riderId,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'View rider KYC details without exposing private object keys',
      operationId: 'RiderOnboardingController_reviewDetails',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Registration & KYC"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/riders/review-queue/${riderId}');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1RidersRiderIdKycDocumentTypeUrlGet({
    required String? riderId,
    required String? documentType,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Create a short-lived private URL to review one KYC image',
      operationId: 'RiderOnboardingController_documentUrl',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Registration & KYC"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse(
      '/api/v1/riders/${riderId}/kyc/${documentType}/url',
    );
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1RidersRiderIdApprovePost({
    required String? riderId,
    required ApproveRiderKycDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Approve KYC, assign a store, and select rider type',
      operationId: 'RiderOnboardingController_approve',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Registration & KYC"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/riders/${riderId}/approve');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1RidersRiderIdRejectPost({
    required String? riderId,
    required RejectRiderKycDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Reject submitted KYC with a reason for resubmission',
      operationId: 'RiderOnboardingController_reject',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Registration & KYC"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/riders/${riderId}/reject');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1RidersRiderIdSuspendPost({
    required String? riderId,
    required SuspendRiderDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Suspend an approved rider and revoke active sessions',
      operationId: 'RiderOnboardingController_suspend',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Rider Registration & KYC"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/riders/${riderId}/suspend');
    final $body = body;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1MapsGeocodeGet({
    required String? q,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Geocode an address using OpenStreetMap',
      operationId: 'MapsController_geocode',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Maps"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/maps/geocode');
    final Map<String, dynamic> $params = <String, dynamic>{'q': q};
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      parameters: $params,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1MapsReverseGeocodeGet({
    required num? latitude,
    required num? longitude,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Reverse-geocode coordinates using OpenStreetMap',
      operationId: 'MapsController_reverseGeocode',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Maps"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/maps/reverse-geocode');
    final Map<String, dynamic> $params = <String, dynamic>{
      'latitude': latitude,
      'longitude': longitude,
    };
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      parameters: $params,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1MapsRouteGet({
    required num? fromLatitude,
    required num? fromLongitude,
    required num? toLatitude,
    required num? toLongitude,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Find a driving route using OSRM',
      operationId: 'MapsController_route',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Maps"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/maps/route');
    final Map<String, dynamic> $params = <String, dynamic>{
      'fromLatitude': fromLatitude,
      'fromLongitude': fromLongitude,
      'toLatitude': toLatitude,
      'toLongitude': toLongitude,
    };
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      parameters: $params,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }
}
