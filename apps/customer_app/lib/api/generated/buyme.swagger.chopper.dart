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
  Future<Response<dynamic>> _apiV1StoresGet({
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'List all active Batticaloa stores with delivery zones',
      operationId: 'StoresController_findAll',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Stores & Zones"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/stores');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1StoresAdminGet({
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary:
          'List all stores, including inactive stores, for Super Admin management',
      operationId: 'StoresController_findAllForAdmin',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Stores & Zones"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/stores/admin');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1StoresIdStatusPatch({
    required String? id,
    required UpdateStoreStatusDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'StoresController_updateStatus',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Stores & Zones"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/stores/${id}/status');
    final $body = body;
    final Request $request = Request(
      'PATCH',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1StoresIdSettingsGet({
    required String? id,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'StoresController_getSettings',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Stores & Zones"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/stores/${id}/settings');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1StoresIdSettingsPatch({
    required String? id,
    required UpdateStoreSettingsDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'StoresController_updateSettings',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Stores & Zones"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/stores/${id}/settings');
    final $body = body;
    final Request $request = Request(
      'PATCH',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1StoresIdZonesZoneIdPricingPatch({
    required String? id,
    required String? zoneId,
    required UpdateDeliveryZonePricingDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'StoresController_updateZonePricing',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Stores & Zones"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/stores/${id}/zones/${zoneId}/pricing');
    final $body = body;
    final Request $request = Request(
      'PATCH',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1StoresIdGet({
    required String? id,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Get single store details by UUID',
      operationId: 'StoresController_findOne',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Stores & Zones"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/stores/${id}');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1StoresFindNearestPost({
    required FindNearestStoreDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Find nearest open store for GPS coordinates',
      operationId: 'StoresController_findNearest',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Stores & Zones"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/stores/find-nearest');
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
  Future<Response<dynamic>> _apiV1CategoriesGet({
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CategoriesController_findAll',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Categories"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/categories');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1CategoriesPost({
    required CreateCategoryDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CategoriesController_create',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Categories"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/categories');
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
  Future<Response<dynamic>> _apiV1CategoriesIdGet({
    required String? id,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CategoriesController_findOne',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Categories"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/categories/${id}');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1CategoriesIdPatch({
    required String? id,
    required UpdateCategoryDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CategoriesController_update',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Categories"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/categories/${id}');
    final $body = body;
    final Request $request = Request(
      'PATCH',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1CategoriesIdDelete({
    required String? id,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CategoriesController_deactivate',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Categories"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/categories/${id}');
    final Request $request = Request(
      'DELETE',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1ProductsGet({
    String? query,
    String? categoryId,
    num? limit,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'ProductsController_findAll',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Products"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/products');
    final Map<String, dynamic> $params = <String, dynamic>{
      'query': query,
      'categoryId': categoryId,
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
  Future<Response<dynamic>> _apiV1ProductsPost({
    required CreateProductDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'ProductsController_create',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Products"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/products');
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
  Future<Response<dynamic>> _apiV1ProductsBarcodeBarcodeGet({
    required String? barcode,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'ProductsController_findByBarcode',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Products"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/products/barcode/${barcode}');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1ProductsIdGet({
    required String? id,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'ProductsController_findOne',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Products"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/products/${id}');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1ProductsIdPatch({
    required String? id,
    required UpdateProductDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'ProductsController_update',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Products"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/products/${id}');
    final $body = body;
    final Request $request = Request(
      'PATCH',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1ProductsIdDelete({
    required String? id,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'ProductsController_deactivate',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Products"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/products/${id}');
    final Request $request = Request(
      'DELETE',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1ProductsIdImagePost({
    required String? id,
    required List<int> image,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'ProductsController_uploadImage',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Products"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/products/${id}/image');
    final List<PartValue> $parts = <PartValue>[
      PartValueFile<List<int>>('image', image),
    ];
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      parts: $parts,
      multipart: true,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1StoresStoreIdCatalogGet({
    required String? storeId,
    String? query,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'StoreInventoryController_catalog',
      consumes: [],
      produces: [],
      security: [],
      tags: ["Store Catalogue & Stock"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/stores/${storeId}/catalog');
    final Map<String, dynamic> $params = <String, dynamic>{'query': query};
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
  Future<Response<dynamic>> _apiV1StoresStoreIdStockGet({
    required String? storeId,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'StoreInventoryController_stock',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Store Catalogue & Stock"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/stores/${storeId}/stock');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1StoresStoreIdCatalogProductIdPost({
    required String? storeId,
    required String? productId,
    required UpdateStoreCatalogDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'StoreInventoryController_updateCatalog',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Store Catalogue & Stock"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse(
      '/api/v1/stores/${storeId}/catalog/${productId}',
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
  Future<Response<dynamic>> _apiV1StoresStoreIdStockProductIdAdjustPost({
    required String? storeId,
    required String? productId,
    required AdjustStockDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'StoreInventoryController_adjustStock',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Store Catalogue & Stock"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse(
      '/api/v1/stores/${storeId}/stock/${productId}/adjust',
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
  Future<Response<dynamic>> _apiV1StoresStoreIdAlertsGet({
    required String? storeId,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'StoreInventoryController_alerts',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Store Catalogue & Stock"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/stores/${storeId}/alerts');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1StoresStoreIdAlertsAlertIdAcknowledgePatch({
    required String? storeId,
    required String? alertId,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'StoreInventoryController_acknowledge',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Store Catalogue & Stock"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse(
      '/api/v1/stores/${storeId}/alerts/${alertId}/acknowledge',
    );
    final Request $request = Request(
      'PATCH',
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
  Future<Response<dynamic>> _apiV1CartStoreIdGet({
    required String? storeId,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CartController_get',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Cart"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/cart/${storeId}');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1CartStoreIdItemsPost({
    required String? storeId,
    required CartItemInputDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CartController_add',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Cart"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/cart/${storeId}/items');
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
  Future<Response<dynamic>> _apiV1CartStoreIdItemsStoreProductIdPatch({
    required String? storeId,
    required String? storeProductId,
    required CartItemQuantityDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CartController_setQuantity',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Cart"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse(
      '/api/v1/cart/${storeId}/items/${storeProductId}',
    );
    final $body = body;
    final Request $request = Request(
      'PATCH',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1CartStoreIdItemsStoreProductIdDelete({
    required String? storeId,
    required String? storeProductId,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'CartController_remove',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Cart"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse(
      '/api/v1/cart/${storeId}/items/${storeProductId}',
    );
    final Request $request = Request(
      'DELETE',
      $url,
      client.baseUrl,
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

  @override
  Future<Response<dynamic>> _apiV1AddressesGet({
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'AddressesController_list',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Customer Addresses"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/addresses');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1AddressesPost({
    required CreateAddressDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'AddressesController_create',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Customer Addresses"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/addresses');
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
  Future<Response<dynamic>> _apiV1AddressesIdPatch({
    required String? id,
    required UpdateAddressDto? body,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'AddressesController_update',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Customer Addresses"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/addresses/${id}');
    final $body = body;
    final Request $request = Request(
      'PATCH',
      $url,
      client.baseUrl,
      body: $body,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }

  @override
  Future<Response<dynamic>> _apiV1AddressesIdDelete({
    required String? id,
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'AddressesController_remove',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Customer Addresses"],
      deprecated: false,
    ),
  }) {
    final Uri $url = Uri.parse('/api/v1/addresses/${id}');
    final Request $request = Request(
      'DELETE',
      $url,
      client.baseUrl,
      tag: swaggerMetaData,
    );
    return client.send<dynamic, dynamic>($request);
  }
}
