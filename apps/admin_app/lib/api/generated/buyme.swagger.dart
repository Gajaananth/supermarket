// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element_parameter

import 'package:json_annotation/json_annotation.dart';
import 'package:json_annotation/json_annotation.dart' as json;
import 'package:collection/collection.dart';

import 'dart:convert';

import 'package:chopper/chopper.dart';

import 'client_mapping.dart';

import 'dart:async';

import 'package:http/http.dart' as http;
import 'package:http/http.dart' show MultipartFile;
import 'package:chopper/chopper.dart' as chopper;

import 'buyme.enums.swagger.dart' as enums;
import 'buyme.metadata.swagger.dart';
export 'buyme.enums.swagger.dart';

part 'buyme.swagger.chopper.dart';
part 'buyme.swagger.g.dart';

// **************************************************************************
// SwaggerChopperGenerator
// **************************************************************************

@ChopperApi()
abstract class Buyme extends ChopperService {
  static Buyme create({
    ChopperClient? client,
    http.Client? httpClient,
    Authenticator? authenticator,
    ErrorConverter? errorConverter,
    Converter? converter,
    Uri? baseUrl,
    List<Interceptor>? interceptors,
  }) {
    if (client != null) {
      return _$Buyme(client);
    }

    final newClient = ChopperClient(
      services: [_$Buyme()],
      converter: converter ?? $JsonSerializableConverter(),
      interceptors: interceptors ?? [],
      client: httpClient,
      authenticator: authenticator,
      errorConverter: errorConverter,
      baseUrl: baseUrl,
    );
    return _$Buyme(newClient);
  }

  ///Request Customer OTP login code (Phone only)
  Future<chopper.Response> apiV1AuthCustomerOtpRequestPost({
    required RequestCustomerOtpDto? body,
  }) {
    return _apiV1AuthCustomerOtpRequestPost(body: body);
  }

  ///Request Customer OTP login code (Phone only)
  @POST(path: '/api/v1/auth/customer/otp-request', optionalBody: true)
  Future<chopper.Response> _apiV1AuthCustomerOtpRequestPost({
    @Body() required RequestCustomerOtpDto? body,
    @chopper.Tag()
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
  });

  ///Verify Customer OTP & issue access + rotating refresh tokens
  Future<chopper.Response> apiV1AuthCustomerOtpVerifyPost({
    required VerifyCustomerOtpDto? body,
  }) {
    return _apiV1AuthCustomerOtpVerifyPost(body: body);
  }

  ///Verify Customer OTP & issue access + rotating refresh tokens
  @POST(path: '/api/v1/auth/customer/otp-verify', optionalBody: true)
  Future<chopper.Response> _apiV1AuthCustomerOtpVerifyPost({
    @Body() required VerifyCustomerOtpDto? body,
    @chopper.Tag()
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
  });

  ///Request Rider OTP login code (Phone or Email)
  Future<chopper.Response> apiV1AuthRiderOtpRequestPost({
    required RequestRiderOtpDto? body,
  }) {
    return _apiV1AuthRiderOtpRequestPost(body: body);
  }

  ///Request Rider OTP login code (Phone or Email)
  @POST(path: '/api/v1/auth/rider/otp-request', optionalBody: true)
  Future<chopper.Response> _apiV1AuthRiderOtpRequestPost({
    @Body() required RequestRiderOtpDto? body,
    @chopper.Tag()
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
  });

  ///Verify Rider OTP & authenticate
  Future<chopper.Response> apiV1AuthRiderOtpVerifyPost({
    required VerifyRiderOtpDto? body,
  }) {
    return _apiV1AuthRiderOtpVerifyPost(body: body);
  }

  ///Verify Rider OTP & authenticate
  @POST(path: '/api/v1/auth/rider/otp-verify', optionalBody: true)
  Future<chopper.Response> _apiV1AuthRiderOtpVerifyPost({
    @Body() required VerifyRiderOtpDto? body,
    @chopper.Tag()
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
  });

  ///Request an OTP to register a rider account
  Future<chopper.Response> apiV1AuthRiderRegistrationOtpRequestPost({
    required RequestRiderRegistrationOtpDto? body,
  }) {
    return _apiV1AuthRiderRegistrationOtpRequestPost(body: body);
  }

  ///Request an OTP to register a rider account
  @POST(path: '/api/v1/auth/rider/registration/otp-request', optionalBody: true)
  Future<chopper.Response> _apiV1AuthRiderRegistrationOtpRequestPost({
    @Body() required RequestRiderRegistrationOtpDto? body,
    @chopper.Tag()
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
  });

  ///Verify registration OTP and create a pending rider account
  Future<chopper.Response> apiV1AuthRiderRegistrationOtpVerifyPost({
    required VerifyRiderRegistrationOtpDto? body,
  }) {
    return _apiV1AuthRiderRegistrationOtpVerifyPost(body: body);
  }

  ///Verify registration OTP and create a pending rider account
  @POST(path: '/api/v1/auth/rider/registration/otp-verify', optionalBody: true)
  Future<chopper.Response> _apiV1AuthRiderRegistrationOtpVerifyPost({
    @Body() required VerifyRiderRegistrationOtpDto? body,
    @chopper.Tag()
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
  });

  ///Admin login by Email + Argon2 Password (Optional 2FA for Super Admin)
  Future<chopper.Response> apiV1AuthAdminLoginPost({
    required AdminLoginDto? body,
  }) {
    return _apiV1AuthAdminLoginPost(body: body);
  }

  ///Admin login by Email + Argon2 Password (Optional 2FA for Super Admin)
  @POST(path: '/api/v1/auth/admin/login', optionalBody: true)
  Future<chopper.Response> _apiV1AuthAdminLoginPost({
    @Body() required AdminLoginDto? body,
    @chopper.Tag()
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
  });

  ///Verify Super Admin 2FA OTP code
  Future<chopper.Response> apiV1AuthAdminVerify2faPost({
    required AdminVerify2faDto? body,
  }) {
    return _apiV1AuthAdminVerify2faPost(body: body);
  }

  ///Verify Super Admin 2FA OTP code
  @POST(path: '/api/v1/auth/admin/verify-2fa', optionalBody: true)
  Future<chopper.Response> _apiV1AuthAdminVerify2faPost({
    @Body() required AdminVerify2faDto? body,
    @chopper.Tag()
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
  });

  ///Rotate refresh token (Replay attack detection & revocation)
  Future<chopper.Response> apiV1AuthRefreshPost({
    required RefreshTokenDto? body,
  }) {
    return _apiV1AuthRefreshPost(body: body);
  }

  ///Rotate refresh token (Replay attack detection & revocation)
  @POST(path: '/api/v1/auth/refresh', optionalBody: true)
  Future<chopper.Response> _apiV1AuthRefreshPost({
    @Body() required RefreshTokenDto? body,
    @chopper.Tag()
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
  });

  ///Logout and revoke device refresh session
  Future<chopper.Response> apiV1AuthLogoutPost({
    required RefreshTokenDto? body,
  }) {
    return _apiV1AuthLogoutPost(body: body);
  }

  ///Logout and revoke device refresh session
  @POST(path: '/api/v1/auth/logout', optionalBody: true)
  Future<chopper.Response> _apiV1AuthLogoutPost({
    @Body() required RefreshTokenDto? body,
    @chopper.Tag()
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
  });

  ///Revoke all active sessions for the authenticated account
  Future<chopper.Response> apiV1AuthLogoutAllPost() {
    return _apiV1AuthLogoutAllPost();
  }

  ///Revoke all active sessions for the authenticated account
  @POST(path: '/api/v1/auth/logout-all', optionalBody: true)
  Future<chopper.Response> _apiV1AuthLogoutAllPost({
    @chopper.Tag()
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
  });

  ///Register an FCM token for an active signed-in device
  Future<chopper.Response> apiV1AuthPushTokenPost({
    required RegisterPushTokenDto? body,
  }) {
    return _apiV1AuthPushTokenPost(body: body);
  }

  ///Register an FCM token for an active signed-in device
  @POST(path: '/api/v1/auth/push-token', optionalBody: true)
  Future<chopper.Response> _apiV1AuthPushTokenPost({
    @Body() required RegisterPushTokenDto? body,
    @chopper.Tag()
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
  });

  ///Get current authenticated user profile
  Future<chopper.Response> apiV1AuthMeGet() {
    return _apiV1AuthMeGet();
  }

  ///Get current authenticated user profile
  @GET(path: '/api/v1/auth/me')
  Future<chopper.Response> _apiV1AuthMeGet({
    @chopper.Tag()
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
  });

  ///List all active Batticaloa stores with delivery zones
  Future<chopper.Response> apiV1StoresGet() {
    return _apiV1StoresGet();
  }

  ///List all active Batticaloa stores with delivery zones
  @GET(path: '/api/v1/stores')
  Future<chopper.Response> _apiV1StoresGet({
    @chopper.Tag()
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
  });

  ///List all stores, including inactive stores, for Super Admin management
  Future<chopper.Response> apiV1StoresAdminGet() {
    return _apiV1StoresAdminGet();
  }

  ///List all stores, including inactive stores, for Super Admin management
  @GET(path: '/api/v1/stores/admin')
  Future<chopper.Response> _apiV1StoresAdminGet({
    @chopper.Tag()
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
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1StoresIdStatusPatch({
    required String? id,
    required UpdateStoreStatusDto? body,
  }) {
    return _apiV1StoresIdStatusPatch(id: id, body: body);
  }

  ///
  ///@param id
  @PATCH(path: '/api/v1/stores/{id}/status', optionalBody: true)
  Future<chopper.Response> _apiV1StoresIdStatusPatch({
    @Path('id') required String? id,
    @Body() required UpdateStoreStatusDto? body,
    @chopper.Tag()
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
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1StoresIdSettingsGet({required String? id}) {
    return _apiV1StoresIdSettingsGet(id: id);
  }

  ///
  ///@param id
  @GET(path: '/api/v1/stores/{id}/settings')
  Future<chopper.Response> _apiV1StoresIdSettingsGet({
    @Path('id') required String? id,
    @chopper.Tag()
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
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1StoresIdSettingsPatch({
    required String? id,
    required UpdateStoreSettingsDto? body,
  }) {
    return _apiV1StoresIdSettingsPatch(id: id, body: body);
  }

  ///
  ///@param id
  @PATCH(path: '/api/v1/stores/{id}/settings', optionalBody: true)
  Future<chopper.Response> _apiV1StoresIdSettingsPatch({
    @Path('id') required String? id,
    @Body() required UpdateStoreSettingsDto? body,
    @chopper.Tag()
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
  });

  ///
  ///@param id
  ///@param zoneId
  Future<chopper.Response> apiV1StoresIdZonesZoneIdPricingPatch({
    required String? id,
    required String? zoneId,
    required UpdateDeliveryZonePricingDto? body,
  }) {
    return _apiV1StoresIdZonesZoneIdPricingPatch(
      id: id,
      zoneId: zoneId,
      body: body,
    );
  }

  ///
  ///@param id
  ///@param zoneId
  @PATCH(path: '/api/v1/stores/{id}/zones/{zoneId}/pricing', optionalBody: true)
  Future<chopper.Response> _apiV1StoresIdZonesZoneIdPricingPatch({
    @Path('id') required String? id,
    @Path('zoneId') required String? zoneId,
    @Body() required UpdateDeliveryZonePricingDto? body,
    @chopper.Tag()
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
  });

  ///Get single store details by UUID
  ///@param id
  Future<chopper.Response> apiV1StoresIdGet({required String? id}) {
    return _apiV1StoresIdGet(id: id);
  }

  ///Get single store details by UUID
  ///@param id
  @GET(path: '/api/v1/stores/{id}')
  Future<chopper.Response> _apiV1StoresIdGet({
    @Path('id') required String? id,
    @chopper.Tag()
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
  });

  ///Find nearest open store for GPS coordinates
  Future<chopper.Response> apiV1StoresFindNearestPost({
    required FindNearestStoreDto? body,
  }) {
    return _apiV1StoresFindNearestPost(body: body);
  }

  ///Find nearest open store for GPS coordinates
  @POST(path: '/api/v1/stores/find-nearest', optionalBody: true)
  Future<chopper.Response> _apiV1StoresFindNearestPost({
    @Body() required FindNearestStoreDto? body,
    @chopper.Tag()
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
  });

  ///
  Future<chopper.Response> apiV1WarehouseStockGet() {
    return _apiV1WarehouseStockGet();
  }

  ///
  @GET(path: '/api/v1/warehouse/stock')
  Future<chopper.Response> _apiV1WarehouseStockGet({
    @chopper.Tag()
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'WarehouseInventoryController_list',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Warehouse Stock"],
      deprecated: false,
    ),
  });

  ///
  Future<chopper.Response> apiV1WarehouseStockLowStockGet() {
    return _apiV1WarehouseStockLowStockGet();
  }

  ///
  @GET(path: '/api/v1/warehouse/stock/low-stock')
  Future<chopper.Response> _apiV1WarehouseStockLowStockGet({
    @chopper.Tag()
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'WarehouseInventoryController_lowStock',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Warehouse Stock"],
      deprecated: false,
    ),
  });

  ///
  ///@param productId
  Future<chopper.Response> apiV1WarehouseStockProductIdAdjustPost({
    required String? productId,
    required AdjustStockDto? body,
  }) {
    return _apiV1WarehouseStockProductIdAdjustPost(
      productId: productId,
      body: body,
    );
  }

  ///
  ///@param productId
  @POST(path: '/api/v1/warehouse/stock/{productId}/adjust', optionalBody: true)
  Future<chopper.Response> _apiV1WarehouseStockProductIdAdjustPost({
    @Path('productId') required String? productId,
    @Body() required AdjustStockDto? body,
    @chopper.Tag()
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'WarehouseInventoryController_adjust',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Warehouse Stock"],
      deprecated: false,
    ),
  });

  ///
  ///@param productId
  Future<chopper.Response> apiV1WarehouseStockProductIdReorderLevelPatch({
    required String? productId,
    required UpdateReorderLevelDto? body,
  }) {
    return _apiV1WarehouseStockProductIdReorderLevelPatch(
      productId: productId,
      body: body,
    );
  }

  ///
  ///@param productId
  @PATCH(
    path: '/api/v1/warehouse/stock/{productId}/reorder-level',
    optionalBody: true,
  )
  Future<chopper.Response> _apiV1WarehouseStockProductIdReorderLevelPatch({
    @Path('productId') required String? productId,
    @Body() required UpdateReorderLevelDto? body,
    @chopper.Tag()
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'WarehouseInventoryController_setReorderLevel',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Warehouse Stock"],
      deprecated: false,
    ),
  });

  ///
  ///@param storeId
  ///@param query
  Future<chopper.Response> apiV1StoresStoreIdCatalogGet({
    required String? storeId,
    String? query,
  }) {
    return _apiV1StoresStoreIdCatalogGet(storeId: storeId, query: query);
  }

  ///
  ///@param storeId
  ///@param query
  @GET(path: '/api/v1/stores/{storeId}/catalog')
  Future<chopper.Response> _apiV1StoresStoreIdCatalogGet({
    @Path('storeId') required String? storeId,
    @Query('query') String? query,
    @chopper.Tag()
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
  });

  ///
  ///@param storeId
  Future<chopper.Response> apiV1StoresStoreIdStockGet({
    required String? storeId,
  }) {
    return _apiV1StoresStoreIdStockGet(storeId: storeId);
  }

  ///
  ///@param storeId
  @GET(path: '/api/v1/stores/{storeId}/stock')
  Future<chopper.Response> _apiV1StoresStoreIdStockGet({
    @Path('storeId') required String? storeId,
    @chopper.Tag()
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
  });

  ///
  ///@param storeId
  ///@param productId
  Future<chopper.Response> apiV1StoresStoreIdCatalogProductIdPost({
    required String? storeId,
    required String? productId,
    required UpdateStoreCatalogDto? body,
  }) {
    return _apiV1StoresStoreIdCatalogProductIdPost(
      storeId: storeId,
      productId: productId,
      body: body,
    );
  }

  ///
  ///@param storeId
  ///@param productId
  @POST(
    path: '/api/v1/stores/{storeId}/catalog/{productId}',
    optionalBody: true,
  )
  Future<chopper.Response> _apiV1StoresStoreIdCatalogProductIdPost({
    @Path('storeId') required String? storeId,
    @Path('productId') required String? productId,
    @Body() required UpdateStoreCatalogDto? body,
    @chopper.Tag()
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
  });

  ///
  ///@param storeId
  ///@param productId
  Future<chopper.Response> apiV1StoresStoreIdStockProductIdAdjustPost({
    required String? storeId,
    required String? productId,
    required AdjustStockDto? body,
  }) {
    return _apiV1StoresStoreIdStockProductIdAdjustPost(
      storeId: storeId,
      productId: productId,
      body: body,
    );
  }

  ///
  ///@param storeId
  ///@param productId
  @POST(
    path: '/api/v1/stores/{storeId}/stock/{productId}/adjust',
    optionalBody: true,
  )
  Future<chopper.Response> _apiV1StoresStoreIdStockProductIdAdjustPost({
    @Path('storeId') required String? storeId,
    @Path('productId') required String? productId,
    @Body() required AdjustStockDto? body,
    @chopper.Tag()
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
  });

  ///
  ///@param storeId
  Future<chopper.Response> apiV1StoresStoreIdAlertsGet({
    required String? storeId,
  }) {
    return _apiV1StoresStoreIdAlertsGet(storeId: storeId);
  }

  ///
  ///@param storeId
  @GET(path: '/api/v1/stores/{storeId}/alerts')
  Future<chopper.Response> _apiV1StoresStoreIdAlertsGet({
    @Path('storeId') required String? storeId,
    @chopper.Tag()
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
  });

  ///
  ///@param storeId
  ///@param alertId
  Future<chopper.Response> apiV1StoresStoreIdAlertsAlertIdAcknowledgePatch({
    required String? storeId,
    required String? alertId,
  }) {
    return _apiV1StoresStoreIdAlertsAlertIdAcknowledgePatch(
      storeId: storeId,
      alertId: alertId,
    );
  }

  ///
  ///@param storeId
  ///@param alertId
  @PATCH(
    path: '/api/v1/stores/{storeId}/alerts/{alertId}/acknowledge',
    optionalBody: true,
  )
  Future<chopper.Response> _apiV1StoresStoreIdAlertsAlertIdAcknowledgePatch({
    @Path('storeId') required String? storeId,
    @Path('alertId') required String? alertId,
    @chopper.Tag()
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
  });

  ///
  ///@param storeId
  ///@param status
  Future<chopper.Response> apiV1TransfersGet({
    String? storeId,
    enums.ApiV1TransfersGetStatus? status,
  }) {
    return _apiV1TransfersGet(
      storeId: storeId,
      status: status?.value?.toString(),
    );
  }

  ///
  ///@param storeId
  ///@param status
  @GET(path: '/api/v1/transfers')
  Future<chopper.Response> _apiV1TransfersGet({
    @Query('storeId') String? storeId,
    @Query('status') String? status,
    @chopper.Tag()
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'TransfersController_list',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Stock Transfers"],
      deprecated: false,
    ),
  });

  ///
  Future<chopper.Response> apiV1TransfersPost({
    required CreateTransferDto? body,
  }) {
    return _apiV1TransfersPost(body: body);
  }

  ///
  @POST(path: '/api/v1/transfers', optionalBody: true)
  Future<chopper.Response> _apiV1TransfersPost({
    @Body() required CreateTransferDto? body,
    @chopper.Tag()
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'TransfersController_create',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Stock Transfers"],
      deprecated: false,
    ),
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1TransfersIdGet({required String? id}) {
    return _apiV1TransfersIdGet(id: id);
  }

  ///
  ///@param id
  @GET(path: '/api/v1/transfers/{id}')
  Future<chopper.Response> _apiV1TransfersIdGet({
    @Path('id') required String? id,
    @chopper.Tag()
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'TransfersController_findOne',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Stock Transfers"],
      deprecated: false,
    ),
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1TransfersIdDispatchPost({required String? id}) {
    return _apiV1TransfersIdDispatchPost(id: id);
  }

  ///
  ///@param id
  @POST(path: '/api/v1/transfers/{id}/dispatch', optionalBody: true)
  Future<chopper.Response> _apiV1TransfersIdDispatchPost({
    @Path('id') required String? id,
    @chopper.Tag()
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'TransfersController_dispatch',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Stock Transfers"],
      deprecated: false,
    ),
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1TransfersIdReceivePost({
    required String? id,
    required ReceiveTransferDto? body,
  }) {
    return _apiV1TransfersIdReceivePost(id: id, body: body);
  }

  ///
  ///@param id
  @POST(path: '/api/v1/transfers/{id}/receive', optionalBody: true)
  Future<chopper.Response> _apiV1TransfersIdReceivePost({
    @Path('id') required String? id,
    @Body() required ReceiveTransferDto? body,
    @chopper.Tag()
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'TransfersController_receive',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Stock Transfers"],
      deprecated: false,
    ),
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1TransfersIdResolvePost({
    required String? id,
    required ResolveTransferDto? body,
  }) {
    return _apiV1TransfersIdResolvePost(id: id, body: body);
  }

  ///
  ///@param id
  @POST(path: '/api/v1/transfers/{id}/resolve', optionalBody: true)
  Future<chopper.Response> _apiV1TransfersIdResolvePost({
    @Path('id') required String? id,
    @Body() required ResolveTransferDto? body,
    @chopper.Tag()
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'TransfersController_resolve',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Stock Transfers"],
      deprecated: false,
    ),
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1TransfersIdRevertPost({required String? id}) {
    return _apiV1TransfersIdRevertPost(id: id);
  }

  ///
  ///@param id
  @POST(path: '/api/v1/transfers/{id}/revert', optionalBody: true)
  Future<chopper.Response> _apiV1TransfersIdRevertPost({
    @Path('id') required String? id,
    @chopper.Tag()
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'TransfersController_revert',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Stock Transfers"],
      deprecated: false,
    ),
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1TransfersIdCancelPost({required String? id}) {
    return _apiV1TransfersIdCancelPost(id: id);
  }

  ///
  ///@param id
  @POST(path: '/api/v1/transfers/{id}/cancel', optionalBody: true)
  Future<chopper.Response> _apiV1TransfersIdCancelPost({
    @Path('id') required String? id,
    @chopper.Tag()
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: '',
      operationId: 'TransfersController_cancel',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Stock Transfers"],
      deprecated: false,
    ),
  });

  ///
  Future<chopper.Response> apiV1OrdersPost({required CreateOrderDto? body}) {
    return _apiV1OrdersPost(body: body);
  }

  ///
  @POST(path: '/api/v1/orders', optionalBody: true)
  Future<chopper.Response> _apiV1OrdersPost({
    @Body() required CreateOrderDto? body,
    @chopper.Tag()
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
  });

  ///
  ///@param status
  ///@param storeId
  ///@param limit
  Future<chopper.Response> apiV1OrdersGet({
    enums.ApiV1OrdersGetStatus? status,
    String? storeId,
    num? limit,
  }) {
    return _apiV1OrdersGet(
      status: status?.value?.toString(),
      storeId: storeId,
      limit: limit,
    );
  }

  ///
  ///@param status
  ///@param storeId
  ///@param limit
  @GET(path: '/api/v1/orders')
  Future<chopper.Response> _apiV1OrdersGet({
    @Query('status') String? status,
    @Query('storeId') String? storeId,
    @Query('limit') num? limit,
    @chopper.Tag()
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
  });

  ///
  Future<chopper.Response> apiV1OrdersCheckoutPost({
    required CheckoutOrderDto? body,
  }) {
    return _apiV1OrdersCheckoutPost(body: body);
  }

  ///
  @POST(path: '/api/v1/orders/checkout', optionalBody: true)
  Future<chopper.Response> _apiV1OrdersCheckoutPost({
    @Body() required CheckoutOrderDto? body,
    @chopper.Tag()
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
  });

  ///
  Future<chopper.Response> apiV1OrdersEligibleRidersGet() {
    return _apiV1OrdersEligibleRidersGet();
  }

  ///
  @GET(path: '/api/v1/orders/eligible-riders')
  Future<chopper.Response> _apiV1OrdersEligibleRidersGet({
    @chopper.Tag()
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
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1OrdersIdGet({required String? id}) {
    return _apiV1OrdersIdGet(id: id);
  }

  ///
  ///@param id
  @GET(path: '/api/v1/orders/{id}')
  Future<chopper.Response> _apiV1OrdersIdGet({
    @Path('id') required String? id,
    @chopper.Tag()
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
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1OrdersIdCancelPost({
    required String? id,
    required OrderReasonDto? body,
  }) {
    return _apiV1OrdersIdCancelPost(id: id, body: body);
  }

  ///
  ///@param id
  @POST(path: '/api/v1/orders/{id}/cancel', optionalBody: true)
  Future<chopper.Response> _apiV1OrdersIdCancelPost({
    @Path('id') required String? id,
    @Body() required OrderReasonDto? body,
    @chopper.Tag()
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
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1OrdersIdAcceptPost({
    required String? id,
    required OrderNoteDto? body,
  }) {
    return _apiV1OrdersIdAcceptPost(id: id, body: body);
  }

  ///
  ///@param id
  @POST(path: '/api/v1/orders/{id}/accept', optionalBody: true)
  Future<chopper.Response> _apiV1OrdersIdAcceptPost({
    @Path('id') required String? id,
    @Body() required OrderNoteDto? body,
    @chopper.Tag()
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
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1OrdersIdRejectPost({
    required String? id,
    required OrderReasonDto? body,
  }) {
    return _apiV1OrdersIdRejectPost(id: id, body: body);
  }

  ///
  ///@param id
  @POST(path: '/api/v1/orders/{id}/reject', optionalBody: true)
  Future<chopper.Response> _apiV1OrdersIdRejectPost({
    @Path('id') required String? id,
    @Body() required OrderReasonDto? body,
    @chopper.Tag()
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
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1OrdersIdPreparingPost({
    required String? id,
    required OrderNoteDto? body,
  }) {
    return _apiV1OrdersIdPreparingPost(id: id, body: body);
  }

  ///
  ///@param id
  @POST(path: '/api/v1/orders/{id}/preparing', optionalBody: true)
  Future<chopper.Response> _apiV1OrdersIdPreparingPost({
    @Path('id') required String? id,
    @Body() required OrderNoteDto? body,
    @chopper.Tag()
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
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1OrdersIdReadyPost({
    required String? id,
    required OrderNoteDto? body,
  }) {
    return _apiV1OrdersIdReadyPost(id: id, body: body);
  }

  ///
  ///@param id
  @POST(path: '/api/v1/orders/{id}/ready', optionalBody: true)
  Future<chopper.Response> _apiV1OrdersIdReadyPost({
    @Path('id') required String? id,
    @Body() required OrderNoteDto? body,
    @chopper.Tag()
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
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1OrdersIdAssignRiderPost({
    required String? id,
    required AssignOrderRiderDto? body,
  }) {
    return _apiV1OrdersIdAssignRiderPost(id: id, body: body);
  }

  ///
  ///@param id
  @POST(path: '/api/v1/orders/{id}/assign-rider', optionalBody: true)
  Future<chopper.Response> _apiV1OrdersIdAssignRiderPost({
    @Path('id') required String? id,
    @Body() required AssignOrderRiderDto? body,
    @chopper.Tag()
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
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1OrdersIdRiderRejectPost({
    required String? id,
    required OrderReasonDto? body,
  }) {
    return _apiV1OrdersIdRiderRejectPost(id: id, body: body);
  }

  ///
  ///@param id
  @POST(path: '/api/v1/orders/{id}/rider-reject', optionalBody: true)
  Future<chopper.Response> _apiV1OrdersIdRiderRejectPost({
    @Path('id') required String? id,
    @Body() required OrderReasonDto? body,
    @chopper.Tag()
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
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1OrdersIdPickUpPost({
    required String? id,
    required OrderNoteDto? body,
  }) {
    return _apiV1OrdersIdPickUpPost(id: id, body: body);
  }

  ///
  ///@param id
  @POST(path: '/api/v1/orders/{id}/pick-up', optionalBody: true)
  Future<chopper.Response> _apiV1OrdersIdPickUpPost({
    @Path('id') required String? id,
    @Body() required OrderNoteDto? body,
    @chopper.Tag()
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
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1OrdersIdStartDeliveryPost({
    required String? id,
    required OrderNoteDto? body,
  }) {
    return _apiV1OrdersIdStartDeliveryPost(id: id, body: body);
  }

  ///
  ///@param id
  @POST(path: '/api/v1/orders/{id}/start-delivery', optionalBody: true)
  Future<chopper.Response> _apiV1OrdersIdStartDeliveryPost({
    @Path('id') required String? id,
    @Body() required OrderNoteDto? body,
    @chopper.Tag()
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
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1OrdersIdDeliverPost({
    required String? id,
    required DeliverOrderDto? body,
  }) {
    return _apiV1OrdersIdDeliverPost(id: id, body: body);
  }

  ///
  ///@param id
  @POST(path: '/api/v1/orders/{id}/deliver', optionalBody: true)
  Future<chopper.Response> _apiV1OrdersIdDeliverPost({
    @Path('id') required String? id,
    @Body() required DeliverOrderDto? body,
    @chopper.Tag()
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
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1OrdersIdFailPost({
    required String? id,
    required OrderReasonDto? body,
  }) {
    return _apiV1OrdersIdFailPost(id: id, body: body);
  }

  ///
  ///@param id
  @POST(path: '/api/v1/orders/{id}/fail', optionalBody: true)
  Future<chopper.Response> _apiV1OrdersIdFailPost({
    @Path('id') required String? id,
    @Body() required OrderReasonDto? body,
    @chopper.Tag()
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
  });

  ///
  Future<chopper.Response> apiV1CashControlMeGet() {
    return _apiV1CashControlMeGet();
  }

  ///
  @GET(path: '/api/v1/cash-control/me')
  Future<chopper.Response> _apiV1CashControlMeGet({
    @chopper.Tag()
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
  });

  ///
  Future<chopper.Response> apiV1CashControlDepositsUploadUrlPost({
    required DepositUploadUrlDto? body,
  }) {
    return _apiV1CashControlDepositsUploadUrlPost(body: body);
  }

  ///
  @POST(path: '/api/v1/cash-control/deposits/upload-url', optionalBody: true)
  Future<chopper.Response> _apiV1CashControlDepositsUploadUrlPost({
    @Body() required DepositUploadUrlDto? body,
    @chopper.Tag()
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
  });

  ///
  Future<chopper.Response> apiV1CashControlDepositsPost({
    required CreateRiderDepositDto? body,
  }) {
    return _apiV1CashControlDepositsPost(body: body);
  }

  ///
  @POST(path: '/api/v1/cash-control/deposits', optionalBody: true)
  Future<chopper.Response> _apiV1CashControlDepositsPost({
    @Body() required CreateRiderDepositDto? body,
    @chopper.Tag()
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
  });

  ///
  ///@param status
  ///@param storeId
  ///@param riderId
  ///@param limit
  Future<chopper.Response> apiV1CashControlDepositsGet({
    enums.ApiV1CashControlDepositsGetStatus? status,
    String? storeId,
    String? riderId,
    num? limit,
  }) {
    return _apiV1CashControlDepositsGet(
      status: status?.value?.toString(),
      storeId: storeId,
      riderId: riderId,
      limit: limit,
    );
  }

  ///
  ///@param status
  ///@param storeId
  ///@param riderId
  ///@param limit
  @GET(path: '/api/v1/cash-control/deposits')
  Future<chopper.Response> _apiV1CashControlDepositsGet({
    @Query('status') String? status,
    @Query('storeId') String? storeId,
    @Query('riderId') String? riderId,
    @Query('limit') num? limit,
    @chopper.Tag()
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
  });

  ///
  ///@param status
  ///@param storeId
  ///@param riderId
  ///@param limit
  Future<chopper.Response> apiV1CashControlDepositsVerificationQueueGet({
    enums.ApiV1CashControlDepositsVerificationQueueGetStatus? status,
    String? storeId,
    String? riderId,
    num? limit,
  }) {
    return _apiV1CashControlDepositsVerificationQueueGet(
      status: status?.value?.toString(),
      storeId: storeId,
      riderId: riderId,
      limit: limit,
    );
  }

  ///
  ///@param status
  ///@param storeId
  ///@param riderId
  ///@param limit
  @GET(path: '/api/v1/cash-control/deposits/verification-queue')
  Future<chopper.Response> _apiV1CashControlDepositsVerificationQueueGet({
    @Query('status') String? status,
    @Query('storeId') String? storeId,
    @Query('riderId') String? riderId,
    @Query('limit') num? limit,
    @chopper.Tag()
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
  });

  ///
  ///@param status
  ///@param storeId
  ///@param limit
  Future<chopper.Response> apiV1CashControlDepositsVarianceCasesGet({
    enums.ApiV1CashControlDepositsVarianceCasesGetStatus? status,
    String? storeId,
    num? limit,
  }) {
    return _apiV1CashControlDepositsVarianceCasesGet(
      status: status?.value?.toString(),
      storeId: storeId,
      limit: limit,
    );
  }

  ///
  ///@param status
  ///@param storeId
  ///@param limit
  @GET(path: '/api/v1/cash-control/deposits/variance-cases')
  Future<chopper.Response> _apiV1CashControlDepositsVarianceCasesGet({
    @Query('status') String? status,
    @Query('storeId') String? storeId,
    @Query('limit') num? limit,
    @chopper.Tag()
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
  });

  ///
  ///@param storeId
  ///@param date Store business date in Asia/Colombo
  Future<chopper.Response> apiV1CashControlStoresStoreIdReconciliationGet({
    required String? storeId,
    required String? date,
  }) {
    return _apiV1CashControlStoresStoreIdReconciliationGet(
      storeId: storeId,
      date: date,
    );
  }

  ///
  ///@param storeId
  ///@param date Store business date in Asia/Colombo
  @GET(path: '/api/v1/cash-control/stores/{storeId}/reconciliation')
  Future<chopper.Response> _apiV1CashControlStoresStoreIdReconciliationGet({
    @Path('storeId') required String? storeId,
    @Query('date') required String? date,
    @chopper.Tag()
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
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1CashControlDepositsIdSlipUrlGet({
    required String? id,
  }) {
    return _apiV1CashControlDepositsIdSlipUrlGet(id: id);
  }

  ///
  ///@param id
  @GET(path: '/api/v1/cash-control/deposits/{id}/slip-url')
  Future<chopper.Response> _apiV1CashControlDepositsIdSlipUrlGet({
    @Path('id') required String? id,
    @chopper.Tag()
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
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1CashControlDepositsIdVerifyPost({
    required String? id,
    required VerifyRiderDepositDto? body,
  }) {
    return _apiV1CashControlDepositsIdVerifyPost(id: id, body: body);
  }

  ///
  ///@param id
  @POST(path: '/api/v1/cash-control/deposits/{id}/verify', optionalBody: true)
  Future<chopper.Response> _apiV1CashControlDepositsIdVerifyPost({
    @Path('id') required String? id,
    @Body() required VerifyRiderDepositDto? body,
    @chopper.Tag()
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
  });

  ///
  ///@param id
  Future<chopper.Response> apiV1CashControlDepositsIdVarianceResolvePost({
    required String? id,
    required ResolveDepositVarianceDto? body,
  }) {
    return _apiV1CashControlDepositsIdVarianceResolvePost(id: id, body: body);
  }

  ///
  ///@param id
  @POST(
    path: '/api/v1/cash-control/deposits/{id}/variance/resolve',
    optionalBody: true,
  )
  Future<chopper.Response> _apiV1CashControlDepositsIdVarianceResolvePost({
    @Path('id') required String? id,
    @Body() required ResolveDepositVarianceDto? body,
    @chopper.Tag()
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
  });

  ///Start a shift for an approved rider with no cash restriction
  Future<chopper.Response> apiV1RidersMeShiftStartPost() {
    return _apiV1RidersMeShiftStartPost();
  }

  ///Start a shift for an approved rider with no cash restriction
  @POST(path: '/api/v1/riders/me/shift/start', optionalBody: true)
  Future<chopper.Response> _apiV1RidersMeShiftStartPost({
    @chopper.Tag()
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
  });

  ///Stop a shift when no active delivery is assigned
  Future<chopper.Response> apiV1RidersMeShiftStopPost() {
    return _apiV1RidersMeShiftStopPost();
  }

  ///Stop a shift when no active delivery is assigned
  @POST(path: '/api/v1/riders/me/shift/stop', optionalBody: true)
  Future<chopper.Response> _apiV1RidersMeShiftStopPost({
    @chopper.Tag()
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
  });

  ///Get the authenticated rider KYC status
  Future<chopper.Response> apiV1RidersMeKycGet() {
    return _apiV1RidersMeKycGet();
  }

  ///Get the authenticated rider KYC status
  @GET(path: '/api/v1/riders/me/kyc')
  Future<chopper.Response> _apiV1RidersMeKycGet({
    @chopper.Tag()
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
  });

  ///Create a short-lived private URL for a KYC image upload
  Future<chopper.Response> apiV1RidersMeKycUploadUrlPost({
    required KycUploadUrlDto? body,
  }) {
    return _apiV1RidersMeKycUploadUrlPost(body: body);
  }

  ///Create a short-lived private URL for a KYC image upload
  @POST(path: '/api/v1/riders/me/kyc/upload-url', optionalBody: true)
  Future<chopper.Response> _apiV1RidersMeKycUploadUrlPost({
    @Body() required KycUploadUrlDto? body,
    @chopper.Tag()
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
  });

  ///Submit or resubmit bike details and scanned licence images
  Future<chopper.Response> apiV1RidersMeKycSubmitPost({
    required SubmitRiderKycDto? body,
  }) {
    return _apiV1RidersMeKycSubmitPost(body: body);
  }

  ///Submit or resubmit bike details and scanned licence images
  @POST(path: '/api/v1/riders/me/kyc/submit', optionalBody: true)
  Future<chopper.Response> _apiV1RidersMeKycSubmitPost({
    @Body() required SubmitRiderKycDto? body,
    @chopper.Tag()
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
  });

  ///List riders awaiting KYC review
  ///@param page
  ///@param pageSize
  Future<chopper.Response> apiV1RidersReviewQueueGet({
    num? page,
    num? pageSize,
  }) {
    return _apiV1RidersReviewQueueGet(page: page, pageSize: pageSize);
  }

  ///List riders awaiting KYC review
  ///@param page
  ///@param pageSize
  @GET(path: '/api/v1/riders/review-queue')
  Future<chopper.Response> _apiV1RidersReviewQueueGet({
    @Query('page') num? page,
    @Query('pageSize') num? pageSize,
    @chopper.Tag()
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
  });

  ///View rider KYC details without exposing private object keys
  ///@param riderId
  Future<chopper.Response> apiV1RidersReviewQueueRiderIdGet({
    required String? riderId,
  }) {
    return _apiV1RidersReviewQueueRiderIdGet(riderId: riderId);
  }

  ///View rider KYC details without exposing private object keys
  ///@param riderId
  @GET(path: '/api/v1/riders/review-queue/{riderId}')
  Future<chopper.Response> _apiV1RidersReviewQueueRiderIdGet({
    @Path('riderId') required String? riderId,
    @chopper.Tag()
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
  });

  ///Create a short-lived private URL to review one KYC image
  ///@param riderId
  ///@param documentType
  Future<chopper.Response> apiV1RidersRiderIdKycDocumentTypeUrlGet({
    required String? riderId,
    required String? documentType,
  }) {
    return _apiV1RidersRiderIdKycDocumentTypeUrlGet(
      riderId: riderId,
      documentType: documentType,
    );
  }

  ///Create a short-lived private URL to review one KYC image
  ///@param riderId
  ///@param documentType
  @GET(path: '/api/v1/riders/{riderId}/kyc/{documentType}/url')
  Future<chopper.Response> _apiV1RidersRiderIdKycDocumentTypeUrlGet({
    @Path('riderId') required String? riderId,
    @Path('documentType') required String? documentType,
    @chopper.Tag()
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
  });

  ///Approve KYC, assign a store, and select rider type
  ///@param riderId
  Future<chopper.Response> apiV1RidersRiderIdApprovePost({
    required String? riderId,
    required ApproveRiderKycDto? body,
  }) {
    return _apiV1RidersRiderIdApprovePost(riderId: riderId, body: body);
  }

  ///Approve KYC, assign a store, and select rider type
  ///@param riderId
  @POST(path: '/api/v1/riders/{riderId}/approve', optionalBody: true)
  Future<chopper.Response> _apiV1RidersRiderIdApprovePost({
    @Path('riderId') required String? riderId,
    @Body() required ApproveRiderKycDto? body,
    @chopper.Tag()
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
  });

  ///Reject submitted KYC with a reason for resubmission
  ///@param riderId
  Future<chopper.Response> apiV1RidersRiderIdRejectPost({
    required String? riderId,
    required RejectRiderKycDto? body,
  }) {
    return _apiV1RidersRiderIdRejectPost(riderId: riderId, body: body);
  }

  ///Reject submitted KYC with a reason for resubmission
  ///@param riderId
  @POST(path: '/api/v1/riders/{riderId}/reject', optionalBody: true)
  Future<chopper.Response> _apiV1RidersRiderIdRejectPost({
    @Path('riderId') required String? riderId,
    @Body() required RejectRiderKycDto? body,
    @chopper.Tag()
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
  });

  ///Suspend an approved rider and revoke active sessions
  ///@param riderId
  Future<chopper.Response> apiV1RidersRiderIdSuspendPost({
    required String? riderId,
    required SuspendRiderDto? body,
  }) {
    return _apiV1RidersRiderIdSuspendPost(riderId: riderId, body: body);
  }

  ///Suspend an approved rider and revoke active sessions
  ///@param riderId
  @POST(path: '/api/v1/riders/{riderId}/suspend', optionalBody: true)
  Future<chopper.Response> _apiV1RidersRiderIdSuspendPost({
    @Path('riderId') required String? riderId,
    @Body() required SuspendRiderDto? body,
    @chopper.Tag()
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
  });

  ///Get bounded, store-filterable daily sales and order aggregates
  ///@param from
  ///@param to
  ///@param storeId
  Future<chopper.Response> apiV1ReportsOverviewGet({
    String? from,
    String? to,
    String? storeId,
  }) {
    return _apiV1ReportsOverviewGet(from: from, to: to, storeId: storeId);
  }

  ///Get bounded, store-filterable daily sales and order aggregates
  ///@param from
  ///@param to
  ///@param storeId
  @GET(path: '/api/v1/reports/overview')
  Future<chopper.Response> _apiV1ReportsOverviewGet({
    @Query('from') String? from,
    @Query('to') String? to,
    @Query('storeId') String? storeId,
    @chopper.Tag()
    SwaggerMetaData swaggerMetaData = const SwaggerMetaData(
      description: '',
      summary: 'Get bounded, store-filterable daily sales and order aggregates',
      operationId: 'ReportsController_overview',
      consumes: [],
      produces: [],
      security: ["JWT-auth"],
      tags: ["Reports"],
      deprecated: false,
    ),
  });
}

@JsonSerializable(explicitToJson: true)
class RequestCustomerOtpDto {
  const RequestCustomerOtpDto({required this.phone});

  factory RequestCustomerOtpDto.fromJson(Map<String, dynamic> json) =>
      _$RequestCustomerOtpDtoFromJson(json);

  static const toJsonFactory = _$RequestCustomerOtpDtoToJson;
  Map<String, dynamic> toJson() => _$RequestCustomerOtpDtoToJson(this);

  @JsonKey(name: 'phone')
  final String phone;
  static const fromJsonFactory = _$RequestCustomerOtpDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is RequestCustomerOtpDto &&
            (identical(other.phone, phone) ||
                const DeepCollectionEquality().equals(other.phone, phone)));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(phone) ^ runtimeType.hashCode;
}

extension $RequestCustomerOtpDtoExtension on RequestCustomerOtpDto {
  RequestCustomerOtpDto copyWith({String? phone}) {
    return RequestCustomerOtpDto(phone: phone ?? this.phone);
  }

  RequestCustomerOtpDto copyWithWrapped({Wrapped<String>? phone}) {
    return RequestCustomerOtpDto(
      phone: (phone != null ? phone.value : this.phone),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class VerifyCustomerOtpDto {
  const VerifyCustomerOtpDto({
    required this.phone,
    required this.code,
    required this.deviceId,
    this.deviceInfo,
  });

  factory VerifyCustomerOtpDto.fromJson(Map<String, dynamic> json) =>
      _$VerifyCustomerOtpDtoFromJson(json);

  static const toJsonFactory = _$VerifyCustomerOtpDtoToJson;
  Map<String, dynamic> toJson() => _$VerifyCustomerOtpDtoToJson(this);

  @JsonKey(name: 'phone')
  final String phone;
  @JsonKey(name: 'code')
  final String code;
  @JsonKey(name: 'deviceId')
  final String deviceId;
  @JsonKey(name: 'deviceInfo')
  final String? deviceInfo;
  static const fromJsonFactory = _$VerifyCustomerOtpDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is VerifyCustomerOtpDto &&
            (identical(other.phone, phone) ||
                const DeepCollectionEquality().equals(other.phone, phone)) &&
            (identical(other.code, code) ||
                const DeepCollectionEquality().equals(other.code, code)) &&
            (identical(other.deviceId, deviceId) ||
                const DeepCollectionEquality().equals(
                  other.deviceId,
                  deviceId,
                )) &&
            (identical(other.deviceInfo, deviceInfo) ||
                const DeepCollectionEquality().equals(
                  other.deviceInfo,
                  deviceInfo,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(phone) ^
      const DeepCollectionEquality().hash(code) ^
      const DeepCollectionEquality().hash(deviceId) ^
      const DeepCollectionEquality().hash(deviceInfo) ^
      runtimeType.hashCode;
}

extension $VerifyCustomerOtpDtoExtension on VerifyCustomerOtpDto {
  VerifyCustomerOtpDto copyWith({
    String? phone,
    String? code,
    String? deviceId,
    String? deviceInfo,
  }) {
    return VerifyCustomerOtpDto(
      phone: phone ?? this.phone,
      code: code ?? this.code,
      deviceId: deviceId ?? this.deviceId,
      deviceInfo: deviceInfo ?? this.deviceInfo,
    );
  }

  VerifyCustomerOtpDto copyWithWrapped({
    Wrapped<String>? phone,
    Wrapped<String>? code,
    Wrapped<String>? deviceId,
    Wrapped<String?>? deviceInfo,
  }) {
    return VerifyCustomerOtpDto(
      phone: (phone != null ? phone.value : this.phone),
      code: (code != null ? code.value : this.code),
      deviceId: (deviceId != null ? deviceId.value : this.deviceId),
      deviceInfo: (deviceInfo != null ? deviceInfo.value : this.deviceInfo),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class RequestRiderOtpDto {
  const RequestRiderOtpDto({required this.destination});

  factory RequestRiderOtpDto.fromJson(Map<String, dynamic> json) =>
      _$RequestRiderOtpDtoFromJson(json);

  static const toJsonFactory = _$RequestRiderOtpDtoToJson;
  Map<String, dynamic> toJson() => _$RequestRiderOtpDtoToJson(this);

  @JsonKey(name: 'destination')
  final String destination;
  static const fromJsonFactory = _$RequestRiderOtpDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is RequestRiderOtpDto &&
            (identical(other.destination, destination) ||
                const DeepCollectionEquality().equals(
                  other.destination,
                  destination,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(destination) ^ runtimeType.hashCode;
}

extension $RequestRiderOtpDtoExtension on RequestRiderOtpDto {
  RequestRiderOtpDto copyWith({String? destination}) {
    return RequestRiderOtpDto(destination: destination ?? this.destination);
  }

  RequestRiderOtpDto copyWithWrapped({Wrapped<String>? destination}) {
    return RequestRiderOtpDto(
      destination: (destination != null ? destination.value : this.destination),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class VerifyRiderOtpDto {
  const VerifyRiderOtpDto({
    required this.destination,
    required this.code,
    required this.deviceId,
    this.deviceInfo,
  });

  factory VerifyRiderOtpDto.fromJson(Map<String, dynamic> json) =>
      _$VerifyRiderOtpDtoFromJson(json);

  static const toJsonFactory = _$VerifyRiderOtpDtoToJson;
  Map<String, dynamic> toJson() => _$VerifyRiderOtpDtoToJson(this);

  @JsonKey(name: 'destination')
  final String destination;
  @JsonKey(name: 'code')
  final String code;
  @JsonKey(name: 'deviceId')
  final String deviceId;
  @JsonKey(name: 'deviceInfo')
  final String? deviceInfo;
  static const fromJsonFactory = _$VerifyRiderOtpDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is VerifyRiderOtpDto &&
            (identical(other.destination, destination) ||
                const DeepCollectionEquality().equals(
                  other.destination,
                  destination,
                )) &&
            (identical(other.code, code) ||
                const DeepCollectionEquality().equals(other.code, code)) &&
            (identical(other.deviceId, deviceId) ||
                const DeepCollectionEquality().equals(
                  other.deviceId,
                  deviceId,
                )) &&
            (identical(other.deviceInfo, deviceInfo) ||
                const DeepCollectionEquality().equals(
                  other.deviceInfo,
                  deviceInfo,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(destination) ^
      const DeepCollectionEquality().hash(code) ^
      const DeepCollectionEquality().hash(deviceId) ^
      const DeepCollectionEquality().hash(deviceInfo) ^
      runtimeType.hashCode;
}

extension $VerifyRiderOtpDtoExtension on VerifyRiderOtpDto {
  VerifyRiderOtpDto copyWith({
    String? destination,
    String? code,
    String? deviceId,
    String? deviceInfo,
  }) {
    return VerifyRiderOtpDto(
      destination: destination ?? this.destination,
      code: code ?? this.code,
      deviceId: deviceId ?? this.deviceId,
      deviceInfo: deviceInfo ?? this.deviceInfo,
    );
  }

  VerifyRiderOtpDto copyWithWrapped({
    Wrapped<String>? destination,
    Wrapped<String>? code,
    Wrapped<String>? deviceId,
    Wrapped<String?>? deviceInfo,
  }) {
    return VerifyRiderOtpDto(
      destination: (destination != null ? destination.value : this.destination),
      code: (code != null ? code.value : this.code),
      deviceId: (deviceId != null ? deviceId.value : this.deviceId),
      deviceInfo: (deviceInfo != null ? deviceInfo.value : this.deviceInfo),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class RequestRiderRegistrationOtpDto {
  const RequestRiderRegistrationOtpDto({
    required this.fullName,
    required this.phone,
    this.email,
  });

  factory RequestRiderRegistrationOtpDto.fromJson(Map<String, dynamic> json) =>
      _$RequestRiderRegistrationOtpDtoFromJson(json);

  static const toJsonFactory = _$RequestRiderRegistrationOtpDtoToJson;
  Map<String, dynamic> toJson() => _$RequestRiderRegistrationOtpDtoToJson(this);

  @JsonKey(name: 'fullName')
  final String fullName;
  @JsonKey(name: 'phone')
  final String phone;
  @JsonKey(name: 'email')
  final String? email;
  static const fromJsonFactory = _$RequestRiderRegistrationOtpDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is RequestRiderRegistrationOtpDto &&
            (identical(other.fullName, fullName) ||
                const DeepCollectionEquality().equals(
                  other.fullName,
                  fullName,
                )) &&
            (identical(other.phone, phone) ||
                const DeepCollectionEquality().equals(other.phone, phone)) &&
            (identical(other.email, email) ||
                const DeepCollectionEquality().equals(other.email, email)));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(fullName) ^
      const DeepCollectionEquality().hash(phone) ^
      const DeepCollectionEquality().hash(email) ^
      runtimeType.hashCode;
}

extension $RequestRiderRegistrationOtpDtoExtension
    on RequestRiderRegistrationOtpDto {
  RequestRiderRegistrationOtpDto copyWith({
    String? fullName,
    String? phone,
    String? email,
  }) {
    return RequestRiderRegistrationOtpDto(
      fullName: fullName ?? this.fullName,
      phone: phone ?? this.phone,
      email: email ?? this.email,
    );
  }

  RequestRiderRegistrationOtpDto copyWithWrapped({
    Wrapped<String>? fullName,
    Wrapped<String>? phone,
    Wrapped<String?>? email,
  }) {
    return RequestRiderRegistrationOtpDto(
      fullName: (fullName != null ? fullName.value : this.fullName),
      phone: (phone != null ? phone.value : this.phone),
      email: (email != null ? email.value : this.email),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class VerifyRiderRegistrationOtpDto {
  const VerifyRiderRegistrationOtpDto({
    required this.fullName,
    required this.phone,
    this.email,
    required this.code,
    required this.deviceId,
    this.deviceInfo,
  });

  factory VerifyRiderRegistrationOtpDto.fromJson(Map<String, dynamic> json) =>
      _$VerifyRiderRegistrationOtpDtoFromJson(json);

  static const toJsonFactory = _$VerifyRiderRegistrationOtpDtoToJson;
  Map<String, dynamic> toJson() => _$VerifyRiderRegistrationOtpDtoToJson(this);

  @JsonKey(name: 'fullName')
  final String fullName;
  @JsonKey(name: 'phone')
  final String phone;
  @JsonKey(name: 'email')
  final String? email;
  @JsonKey(name: 'code')
  final String code;
  @JsonKey(name: 'deviceId')
  final String deviceId;
  @JsonKey(name: 'deviceInfo')
  final String? deviceInfo;
  static const fromJsonFactory = _$VerifyRiderRegistrationOtpDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is VerifyRiderRegistrationOtpDto &&
            (identical(other.fullName, fullName) ||
                const DeepCollectionEquality().equals(
                  other.fullName,
                  fullName,
                )) &&
            (identical(other.phone, phone) ||
                const DeepCollectionEquality().equals(other.phone, phone)) &&
            (identical(other.email, email) ||
                const DeepCollectionEquality().equals(other.email, email)) &&
            (identical(other.code, code) ||
                const DeepCollectionEquality().equals(other.code, code)) &&
            (identical(other.deviceId, deviceId) ||
                const DeepCollectionEquality().equals(
                  other.deviceId,
                  deviceId,
                )) &&
            (identical(other.deviceInfo, deviceInfo) ||
                const DeepCollectionEquality().equals(
                  other.deviceInfo,
                  deviceInfo,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(fullName) ^
      const DeepCollectionEquality().hash(phone) ^
      const DeepCollectionEquality().hash(email) ^
      const DeepCollectionEquality().hash(code) ^
      const DeepCollectionEquality().hash(deviceId) ^
      const DeepCollectionEquality().hash(deviceInfo) ^
      runtimeType.hashCode;
}

extension $VerifyRiderRegistrationOtpDtoExtension
    on VerifyRiderRegistrationOtpDto {
  VerifyRiderRegistrationOtpDto copyWith({
    String? fullName,
    String? phone,
    String? email,
    String? code,
    String? deviceId,
    String? deviceInfo,
  }) {
    return VerifyRiderRegistrationOtpDto(
      fullName: fullName ?? this.fullName,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      code: code ?? this.code,
      deviceId: deviceId ?? this.deviceId,
      deviceInfo: deviceInfo ?? this.deviceInfo,
    );
  }

  VerifyRiderRegistrationOtpDto copyWithWrapped({
    Wrapped<String>? fullName,
    Wrapped<String>? phone,
    Wrapped<String?>? email,
    Wrapped<String>? code,
    Wrapped<String>? deviceId,
    Wrapped<String?>? deviceInfo,
  }) {
    return VerifyRiderRegistrationOtpDto(
      fullName: (fullName != null ? fullName.value : this.fullName),
      phone: (phone != null ? phone.value : this.phone),
      email: (email != null ? email.value : this.email),
      code: (code != null ? code.value : this.code),
      deviceId: (deviceId != null ? deviceId.value : this.deviceId),
      deviceInfo: (deviceInfo != null ? deviceInfo.value : this.deviceInfo),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class AdminLoginDto {
  const AdminLoginDto({
    required this.email,
    required this.password,
    required this.deviceId,
    this.deviceInfo,
  });

  factory AdminLoginDto.fromJson(Map<String, dynamic> json) =>
      _$AdminLoginDtoFromJson(json);

  static const toJsonFactory = _$AdminLoginDtoToJson;
  Map<String, dynamic> toJson() => _$AdminLoginDtoToJson(this);

  @JsonKey(name: 'email')
  final String email;
  @JsonKey(name: 'password')
  final String password;
  @JsonKey(name: 'deviceId')
  final String deviceId;
  @JsonKey(name: 'deviceInfo')
  final String? deviceInfo;
  static const fromJsonFactory = _$AdminLoginDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is AdminLoginDto &&
            (identical(other.email, email) ||
                const DeepCollectionEquality().equals(other.email, email)) &&
            (identical(other.password, password) ||
                const DeepCollectionEquality().equals(
                  other.password,
                  password,
                )) &&
            (identical(other.deviceId, deviceId) ||
                const DeepCollectionEquality().equals(
                  other.deviceId,
                  deviceId,
                )) &&
            (identical(other.deviceInfo, deviceInfo) ||
                const DeepCollectionEquality().equals(
                  other.deviceInfo,
                  deviceInfo,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(email) ^
      const DeepCollectionEquality().hash(password) ^
      const DeepCollectionEquality().hash(deviceId) ^
      const DeepCollectionEquality().hash(deviceInfo) ^
      runtimeType.hashCode;
}

extension $AdminLoginDtoExtension on AdminLoginDto {
  AdminLoginDto copyWith({
    String? email,
    String? password,
    String? deviceId,
    String? deviceInfo,
  }) {
    return AdminLoginDto(
      email: email ?? this.email,
      password: password ?? this.password,
      deviceId: deviceId ?? this.deviceId,
      deviceInfo: deviceInfo ?? this.deviceInfo,
    );
  }

  AdminLoginDto copyWithWrapped({
    Wrapped<String>? email,
    Wrapped<String>? password,
    Wrapped<String>? deviceId,
    Wrapped<String?>? deviceInfo,
  }) {
    return AdminLoginDto(
      email: (email != null ? email.value : this.email),
      password: (password != null ? password.value : this.password),
      deviceId: (deviceId != null ? deviceId.value : this.deviceId),
      deviceInfo: (deviceInfo != null ? deviceInfo.value : this.deviceInfo),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class AdminVerify2faDto {
  const AdminVerify2faDto({
    required this.email,
    required this.code,
    required this.deviceId,
    this.deviceInfo,
  });

  factory AdminVerify2faDto.fromJson(Map<String, dynamic> json) =>
      _$AdminVerify2faDtoFromJson(json);

  static const toJsonFactory = _$AdminVerify2faDtoToJson;
  Map<String, dynamic> toJson() => _$AdminVerify2faDtoToJson(this);

  @JsonKey(name: 'email')
  final String email;
  @JsonKey(name: 'code')
  final String code;
  @JsonKey(name: 'deviceId')
  final String deviceId;
  @JsonKey(name: 'deviceInfo')
  final String? deviceInfo;
  static const fromJsonFactory = _$AdminVerify2faDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is AdminVerify2faDto &&
            (identical(other.email, email) ||
                const DeepCollectionEquality().equals(other.email, email)) &&
            (identical(other.code, code) ||
                const DeepCollectionEquality().equals(other.code, code)) &&
            (identical(other.deviceId, deviceId) ||
                const DeepCollectionEquality().equals(
                  other.deviceId,
                  deviceId,
                )) &&
            (identical(other.deviceInfo, deviceInfo) ||
                const DeepCollectionEquality().equals(
                  other.deviceInfo,
                  deviceInfo,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(email) ^
      const DeepCollectionEquality().hash(code) ^
      const DeepCollectionEquality().hash(deviceId) ^
      const DeepCollectionEquality().hash(deviceInfo) ^
      runtimeType.hashCode;
}

extension $AdminVerify2faDtoExtension on AdminVerify2faDto {
  AdminVerify2faDto copyWith({
    String? email,
    String? code,
    String? deviceId,
    String? deviceInfo,
  }) {
    return AdminVerify2faDto(
      email: email ?? this.email,
      code: code ?? this.code,
      deviceId: deviceId ?? this.deviceId,
      deviceInfo: deviceInfo ?? this.deviceInfo,
    );
  }

  AdminVerify2faDto copyWithWrapped({
    Wrapped<String>? email,
    Wrapped<String>? code,
    Wrapped<String>? deviceId,
    Wrapped<String?>? deviceInfo,
  }) {
    return AdminVerify2faDto(
      email: (email != null ? email.value : this.email),
      code: (code != null ? code.value : this.code),
      deviceId: (deviceId != null ? deviceId.value : this.deviceId),
      deviceInfo: (deviceInfo != null ? deviceInfo.value : this.deviceInfo),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class RefreshTokenDto {
  const RefreshTokenDto({required this.refreshToken, this.deviceId});

  factory RefreshTokenDto.fromJson(Map<String, dynamic> json) =>
      _$RefreshTokenDtoFromJson(json);

  static const toJsonFactory = _$RefreshTokenDtoToJson;
  Map<String, dynamic> toJson() => _$RefreshTokenDtoToJson(this);

  @JsonKey(name: 'refreshToken')
  final String refreshToken;
  @JsonKey(name: 'deviceId')
  final String? deviceId;
  static const fromJsonFactory = _$RefreshTokenDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is RefreshTokenDto &&
            (identical(other.refreshToken, refreshToken) ||
                const DeepCollectionEquality().equals(
                  other.refreshToken,
                  refreshToken,
                )) &&
            (identical(other.deviceId, deviceId) ||
                const DeepCollectionEquality().equals(
                  other.deviceId,
                  deviceId,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(refreshToken) ^
      const DeepCollectionEquality().hash(deviceId) ^
      runtimeType.hashCode;
}

extension $RefreshTokenDtoExtension on RefreshTokenDto {
  RefreshTokenDto copyWith({String? refreshToken, String? deviceId}) {
    return RefreshTokenDto(
      refreshToken: refreshToken ?? this.refreshToken,
      deviceId: deviceId ?? this.deviceId,
    );
  }

  RefreshTokenDto copyWithWrapped({
    Wrapped<String>? refreshToken,
    Wrapped<String?>? deviceId,
  }) {
    return RefreshTokenDto(
      refreshToken: (refreshToken != null
          ? refreshToken.value
          : this.refreshToken),
      deviceId: (deviceId != null ? deviceId.value : this.deviceId),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class RegisterPushTokenDto {
  const RegisterPushTokenDto({required this.deviceId, required this.pushToken});

  factory RegisterPushTokenDto.fromJson(Map<String, dynamic> json) =>
      _$RegisterPushTokenDtoFromJson(json);

  static const toJsonFactory = _$RegisterPushTokenDtoToJson;
  Map<String, dynamic> toJson() => _$RegisterPushTokenDtoToJson(this);

  @JsonKey(name: 'deviceId')
  final String deviceId;
  @JsonKey(name: 'pushToken')
  final String pushToken;
  static const fromJsonFactory = _$RegisterPushTokenDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is RegisterPushTokenDto &&
            (identical(other.deviceId, deviceId) ||
                const DeepCollectionEquality().equals(
                  other.deviceId,
                  deviceId,
                )) &&
            (identical(other.pushToken, pushToken) ||
                const DeepCollectionEquality().equals(
                  other.pushToken,
                  pushToken,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(deviceId) ^
      const DeepCollectionEquality().hash(pushToken) ^
      runtimeType.hashCode;
}

extension $RegisterPushTokenDtoExtension on RegisterPushTokenDto {
  RegisterPushTokenDto copyWith({String? deviceId, String? pushToken}) {
    return RegisterPushTokenDto(
      deviceId: deviceId ?? this.deviceId,
      pushToken: pushToken ?? this.pushToken,
    );
  }

  RegisterPushTokenDto copyWithWrapped({
    Wrapped<String>? deviceId,
    Wrapped<String>? pushToken,
  }) {
    return RegisterPushTokenDto(
      deviceId: (deviceId != null ? deviceId.value : this.deviceId),
      pushToken: (pushToken != null ? pushToken.value : this.pushToken),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class UpdateStoreStatusDto {
  const UpdateStoreStatusDto({required this.isActive});

  factory UpdateStoreStatusDto.fromJson(Map<String, dynamic> json) =>
      _$UpdateStoreStatusDtoFromJson(json);

  static const toJsonFactory = _$UpdateStoreStatusDtoToJson;
  Map<String, dynamic> toJson() => _$UpdateStoreStatusDtoToJson(this);

  @JsonKey(name: 'isActive')
  final bool isActive;
  static const fromJsonFactory = _$UpdateStoreStatusDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is UpdateStoreStatusDto &&
            (identical(other.isActive, isActive) ||
                const DeepCollectionEquality().equals(
                  other.isActive,
                  isActive,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(isActive) ^ runtimeType.hashCode;
}

extension $UpdateStoreStatusDtoExtension on UpdateStoreStatusDto {
  UpdateStoreStatusDto copyWith({bool? isActive}) {
    return UpdateStoreStatusDto(isActive: isActive ?? this.isActive);
  }

  UpdateStoreStatusDto copyWithWrapped({Wrapped<bool>? isActive}) {
    return UpdateStoreStatusDto(
      isActive: (isActive != null ? isActive.value : this.isActive),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class UpdateStoreSettingsDto {
  const UpdateStoreSettingsDto({
    this.minOrderAmount,
    this.freeDeliveryThreshold,
    this.cashHoldThreshold,
    this.cashHoldMaxHours,
    this.openingTime,
    this.closingTime,
    this.serviceRadiusKm,
  });

  factory UpdateStoreSettingsDto.fromJson(Map<String, dynamic> json) =>
      _$UpdateStoreSettingsDtoFromJson(json);

  static const toJsonFactory = _$UpdateStoreSettingsDtoToJson;
  Map<String, dynamic> toJson() => _$UpdateStoreSettingsDtoToJson(this);

  @JsonKey(name: 'minOrderAmount')
  final double? minOrderAmount;
  @JsonKey(name: 'freeDeliveryThreshold')
  final double? freeDeliveryThreshold;
  @JsonKey(name: 'cashHoldThreshold')
  final double? cashHoldThreshold;
  @JsonKey(name: 'cashHoldMaxHours')
  final double? cashHoldMaxHours;
  @JsonKey(name: 'openingTime')
  final String? openingTime;
  @JsonKey(name: 'closingTime')
  final String? closingTime;
  @JsonKey(name: 'serviceRadiusKm')
  final double? serviceRadiusKm;
  static const fromJsonFactory = _$UpdateStoreSettingsDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is UpdateStoreSettingsDto &&
            (identical(other.minOrderAmount, minOrderAmount) ||
                const DeepCollectionEquality().equals(
                  other.minOrderAmount,
                  minOrderAmount,
                )) &&
            (identical(other.freeDeliveryThreshold, freeDeliveryThreshold) ||
                const DeepCollectionEquality().equals(
                  other.freeDeliveryThreshold,
                  freeDeliveryThreshold,
                )) &&
            (identical(other.cashHoldThreshold, cashHoldThreshold) ||
                const DeepCollectionEquality().equals(
                  other.cashHoldThreshold,
                  cashHoldThreshold,
                )) &&
            (identical(other.cashHoldMaxHours, cashHoldMaxHours) ||
                const DeepCollectionEquality().equals(
                  other.cashHoldMaxHours,
                  cashHoldMaxHours,
                )) &&
            (identical(other.openingTime, openingTime) ||
                const DeepCollectionEquality().equals(
                  other.openingTime,
                  openingTime,
                )) &&
            (identical(other.closingTime, closingTime) ||
                const DeepCollectionEquality().equals(
                  other.closingTime,
                  closingTime,
                )) &&
            (identical(other.serviceRadiusKm, serviceRadiusKm) ||
                const DeepCollectionEquality().equals(
                  other.serviceRadiusKm,
                  serviceRadiusKm,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(minOrderAmount) ^
      const DeepCollectionEquality().hash(freeDeliveryThreshold) ^
      const DeepCollectionEquality().hash(cashHoldThreshold) ^
      const DeepCollectionEquality().hash(cashHoldMaxHours) ^
      const DeepCollectionEquality().hash(openingTime) ^
      const DeepCollectionEquality().hash(closingTime) ^
      const DeepCollectionEquality().hash(serviceRadiusKm) ^
      runtimeType.hashCode;
}

extension $UpdateStoreSettingsDtoExtension on UpdateStoreSettingsDto {
  UpdateStoreSettingsDto copyWith({
    double? minOrderAmount,
    double? freeDeliveryThreshold,
    double? cashHoldThreshold,
    double? cashHoldMaxHours,
    String? openingTime,
    String? closingTime,
    double? serviceRadiusKm,
  }) {
    return UpdateStoreSettingsDto(
      minOrderAmount: minOrderAmount ?? this.minOrderAmount,
      freeDeliveryThreshold:
          freeDeliveryThreshold ?? this.freeDeliveryThreshold,
      cashHoldThreshold: cashHoldThreshold ?? this.cashHoldThreshold,
      cashHoldMaxHours: cashHoldMaxHours ?? this.cashHoldMaxHours,
      openingTime: openingTime ?? this.openingTime,
      closingTime: closingTime ?? this.closingTime,
      serviceRadiusKm: serviceRadiusKm ?? this.serviceRadiusKm,
    );
  }

  UpdateStoreSettingsDto copyWithWrapped({
    Wrapped<double?>? minOrderAmount,
    Wrapped<double?>? freeDeliveryThreshold,
    Wrapped<double?>? cashHoldThreshold,
    Wrapped<double?>? cashHoldMaxHours,
    Wrapped<String?>? openingTime,
    Wrapped<String?>? closingTime,
    Wrapped<double?>? serviceRadiusKm,
  }) {
    return UpdateStoreSettingsDto(
      minOrderAmount: (minOrderAmount != null
          ? minOrderAmount.value
          : this.minOrderAmount),
      freeDeliveryThreshold: (freeDeliveryThreshold != null
          ? freeDeliveryThreshold.value
          : this.freeDeliveryThreshold),
      cashHoldThreshold: (cashHoldThreshold != null
          ? cashHoldThreshold.value
          : this.cashHoldThreshold),
      cashHoldMaxHours: (cashHoldMaxHours != null
          ? cashHoldMaxHours.value
          : this.cashHoldMaxHours),
      openingTime: (openingTime != null ? openingTime.value : this.openingTime),
      closingTime: (closingTime != null ? closingTime.value : this.closingTime),
      serviceRadiusKm: (serviceRadiusKm != null
          ? serviceRadiusKm.value
          : this.serviceRadiusKm),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class UpdateDeliveryZonePricingDto {
  const UpdateDeliveryZonePricingDto({
    this.baseFee,
    this.minOrderForFreeDelivery,
    this.estimatedDeliveryMins,
    this.isActive,
  });

  factory UpdateDeliveryZonePricingDto.fromJson(Map<String, dynamic> json) =>
      _$UpdateDeliveryZonePricingDtoFromJson(json);

  static const toJsonFactory = _$UpdateDeliveryZonePricingDtoToJson;
  Map<String, dynamic> toJson() => _$UpdateDeliveryZonePricingDtoToJson(this);

  @JsonKey(name: 'baseFee')
  final double? baseFee;
  @JsonKey(name: 'minOrderForFreeDelivery')
  final double? minOrderForFreeDelivery;
  @JsonKey(name: 'estimatedDeliveryMins')
  final double? estimatedDeliveryMins;
  @JsonKey(name: 'isActive')
  final bool? isActive;
  static const fromJsonFactory = _$UpdateDeliveryZonePricingDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is UpdateDeliveryZonePricingDto &&
            (identical(other.baseFee, baseFee) ||
                const DeepCollectionEquality().equals(
                  other.baseFee,
                  baseFee,
                )) &&
            (identical(
                  other.minOrderForFreeDelivery,
                  minOrderForFreeDelivery,
                ) ||
                const DeepCollectionEquality().equals(
                  other.minOrderForFreeDelivery,
                  minOrderForFreeDelivery,
                )) &&
            (identical(other.estimatedDeliveryMins, estimatedDeliveryMins) ||
                const DeepCollectionEquality().equals(
                  other.estimatedDeliveryMins,
                  estimatedDeliveryMins,
                )) &&
            (identical(other.isActive, isActive) ||
                const DeepCollectionEquality().equals(
                  other.isActive,
                  isActive,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(baseFee) ^
      const DeepCollectionEquality().hash(minOrderForFreeDelivery) ^
      const DeepCollectionEquality().hash(estimatedDeliveryMins) ^
      const DeepCollectionEquality().hash(isActive) ^
      runtimeType.hashCode;
}

extension $UpdateDeliveryZonePricingDtoExtension
    on UpdateDeliveryZonePricingDto {
  UpdateDeliveryZonePricingDto copyWith({
    double? baseFee,
    double? minOrderForFreeDelivery,
    double? estimatedDeliveryMins,
    bool? isActive,
  }) {
    return UpdateDeliveryZonePricingDto(
      baseFee: baseFee ?? this.baseFee,
      minOrderForFreeDelivery:
          minOrderForFreeDelivery ?? this.minOrderForFreeDelivery,
      estimatedDeliveryMins:
          estimatedDeliveryMins ?? this.estimatedDeliveryMins,
      isActive: isActive ?? this.isActive,
    );
  }

  UpdateDeliveryZonePricingDto copyWithWrapped({
    Wrapped<double?>? baseFee,
    Wrapped<double?>? minOrderForFreeDelivery,
    Wrapped<double?>? estimatedDeliveryMins,
    Wrapped<bool?>? isActive,
  }) {
    return UpdateDeliveryZonePricingDto(
      baseFee: (baseFee != null ? baseFee.value : this.baseFee),
      minOrderForFreeDelivery: (minOrderForFreeDelivery != null
          ? minOrderForFreeDelivery.value
          : this.minOrderForFreeDelivery),
      estimatedDeliveryMins: (estimatedDeliveryMins != null
          ? estimatedDeliveryMins.value
          : this.estimatedDeliveryMins),
      isActive: (isActive != null ? isActive.value : this.isActive),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class FindNearestStoreDto {
  const FindNearestStoreDto({required this.latitude, required this.longitude});

  factory FindNearestStoreDto.fromJson(Map<String, dynamic> json) =>
      _$FindNearestStoreDtoFromJson(json);

  static const toJsonFactory = _$FindNearestStoreDtoToJson;
  Map<String, dynamic> toJson() => _$FindNearestStoreDtoToJson(this);

  @JsonKey(name: 'latitude')
  final double latitude;
  @JsonKey(name: 'longitude')
  final double longitude;
  static const fromJsonFactory = _$FindNearestStoreDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is FindNearestStoreDto &&
            (identical(other.latitude, latitude) ||
                const DeepCollectionEquality().equals(
                  other.latitude,
                  latitude,
                )) &&
            (identical(other.longitude, longitude) ||
                const DeepCollectionEquality().equals(
                  other.longitude,
                  longitude,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(latitude) ^
      const DeepCollectionEquality().hash(longitude) ^
      runtimeType.hashCode;
}

extension $FindNearestStoreDtoExtension on FindNearestStoreDto {
  FindNearestStoreDto copyWith({double? latitude, double? longitude}) {
    return FindNearestStoreDto(
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
    );
  }

  FindNearestStoreDto copyWithWrapped({
    Wrapped<double>? latitude,
    Wrapped<double>? longitude,
  }) {
    return FindNearestStoreDto(
      latitude: (latitude != null ? latitude.value : this.latitude),
      longitude: (longitude != null ? longitude.value : this.longitude),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class CreateCategoryDto {
  const CreateCategoryDto({
    required this.name,
    required this.slug,
    this.nameTa,
    this.icon,
    this.imageUrl,
    this.sortOrder,
    this.isActive,
  });

  factory CreateCategoryDto.fromJson(Map<String, dynamic> json) =>
      _$CreateCategoryDtoFromJson(json);

  static const toJsonFactory = _$CreateCategoryDtoToJson;
  Map<String, dynamic> toJson() => _$CreateCategoryDtoToJson(this);

  @JsonKey(name: 'name')
  final String name;
  @JsonKey(name: 'slug')
  final String slug;
  @JsonKey(name: 'nameTa')
  final String? nameTa;
  @JsonKey(name: 'icon')
  final String? icon;
  @JsonKey(name: 'imageUrl')
  final String? imageUrl;
  @JsonKey(name: 'sortOrder')
  final double? sortOrder;
  @JsonKey(name: 'isActive', defaultValue: true)
  final bool? isActive;
  static const fromJsonFactory = _$CreateCategoryDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is CreateCategoryDto &&
            (identical(other.name, name) ||
                const DeepCollectionEquality().equals(other.name, name)) &&
            (identical(other.slug, slug) ||
                const DeepCollectionEquality().equals(other.slug, slug)) &&
            (identical(other.nameTa, nameTa) ||
                const DeepCollectionEquality().equals(other.nameTa, nameTa)) &&
            (identical(other.icon, icon) ||
                const DeepCollectionEquality().equals(other.icon, icon)) &&
            (identical(other.imageUrl, imageUrl) ||
                const DeepCollectionEquality().equals(
                  other.imageUrl,
                  imageUrl,
                )) &&
            (identical(other.sortOrder, sortOrder) ||
                const DeepCollectionEquality().equals(
                  other.sortOrder,
                  sortOrder,
                )) &&
            (identical(other.isActive, isActive) ||
                const DeepCollectionEquality().equals(
                  other.isActive,
                  isActive,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(name) ^
      const DeepCollectionEquality().hash(slug) ^
      const DeepCollectionEquality().hash(nameTa) ^
      const DeepCollectionEquality().hash(icon) ^
      const DeepCollectionEquality().hash(imageUrl) ^
      const DeepCollectionEquality().hash(sortOrder) ^
      const DeepCollectionEquality().hash(isActive) ^
      runtimeType.hashCode;
}

extension $CreateCategoryDtoExtension on CreateCategoryDto {
  CreateCategoryDto copyWith({
    String? name,
    String? slug,
    String? nameTa,
    String? icon,
    String? imageUrl,
    double? sortOrder,
    bool? isActive,
  }) {
    return CreateCategoryDto(
      name: name ?? this.name,
      slug: slug ?? this.slug,
      nameTa: nameTa ?? this.nameTa,
      icon: icon ?? this.icon,
      imageUrl: imageUrl ?? this.imageUrl,
      sortOrder: sortOrder ?? this.sortOrder,
      isActive: isActive ?? this.isActive,
    );
  }

  CreateCategoryDto copyWithWrapped({
    Wrapped<String>? name,
    Wrapped<String>? slug,
    Wrapped<String?>? nameTa,
    Wrapped<String?>? icon,
    Wrapped<String?>? imageUrl,
    Wrapped<double?>? sortOrder,
    Wrapped<bool?>? isActive,
  }) {
    return CreateCategoryDto(
      name: (name != null ? name.value : this.name),
      slug: (slug != null ? slug.value : this.slug),
      nameTa: (nameTa != null ? nameTa.value : this.nameTa),
      icon: (icon != null ? icon.value : this.icon),
      imageUrl: (imageUrl != null ? imageUrl.value : this.imageUrl),
      sortOrder: (sortOrder != null ? sortOrder.value : this.sortOrder),
      isActive: (isActive != null ? isActive.value : this.isActive),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class UpdateCategoryDto {
  const UpdateCategoryDto({
    this.name,
    this.slug,
    this.nameTa,
    this.icon,
    this.imageUrl,
    this.sortOrder,
    this.isActive,
  });

  factory UpdateCategoryDto.fromJson(Map<String, dynamic> json) =>
      _$UpdateCategoryDtoFromJson(json);

  static const toJsonFactory = _$UpdateCategoryDtoToJson;
  Map<String, dynamic> toJson() => _$UpdateCategoryDtoToJson(this);

  @JsonKey(name: 'name')
  final String? name;
  @JsonKey(name: 'slug')
  final String? slug;
  @JsonKey(name: 'nameTa')
  final String? nameTa;
  @JsonKey(name: 'icon')
  final String? icon;
  @JsonKey(name: 'imageUrl')
  final String? imageUrl;
  @JsonKey(name: 'sortOrder')
  final double? sortOrder;
  @JsonKey(name: 'isActive', defaultValue: true)
  final bool? isActive;
  static const fromJsonFactory = _$UpdateCategoryDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is UpdateCategoryDto &&
            (identical(other.name, name) ||
                const DeepCollectionEquality().equals(other.name, name)) &&
            (identical(other.slug, slug) ||
                const DeepCollectionEquality().equals(other.slug, slug)) &&
            (identical(other.nameTa, nameTa) ||
                const DeepCollectionEquality().equals(other.nameTa, nameTa)) &&
            (identical(other.icon, icon) ||
                const DeepCollectionEquality().equals(other.icon, icon)) &&
            (identical(other.imageUrl, imageUrl) ||
                const DeepCollectionEquality().equals(
                  other.imageUrl,
                  imageUrl,
                )) &&
            (identical(other.sortOrder, sortOrder) ||
                const DeepCollectionEquality().equals(
                  other.sortOrder,
                  sortOrder,
                )) &&
            (identical(other.isActive, isActive) ||
                const DeepCollectionEquality().equals(
                  other.isActive,
                  isActive,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(name) ^
      const DeepCollectionEquality().hash(slug) ^
      const DeepCollectionEquality().hash(nameTa) ^
      const DeepCollectionEquality().hash(icon) ^
      const DeepCollectionEquality().hash(imageUrl) ^
      const DeepCollectionEquality().hash(sortOrder) ^
      const DeepCollectionEquality().hash(isActive) ^
      runtimeType.hashCode;
}

extension $UpdateCategoryDtoExtension on UpdateCategoryDto {
  UpdateCategoryDto copyWith({
    String? name,
    String? slug,
    String? nameTa,
    String? icon,
    String? imageUrl,
    double? sortOrder,
    bool? isActive,
  }) {
    return UpdateCategoryDto(
      name: name ?? this.name,
      slug: slug ?? this.slug,
      nameTa: nameTa ?? this.nameTa,
      icon: icon ?? this.icon,
      imageUrl: imageUrl ?? this.imageUrl,
      sortOrder: sortOrder ?? this.sortOrder,
      isActive: isActive ?? this.isActive,
    );
  }

  UpdateCategoryDto copyWithWrapped({
    Wrapped<String?>? name,
    Wrapped<String?>? slug,
    Wrapped<String?>? nameTa,
    Wrapped<String?>? icon,
    Wrapped<String?>? imageUrl,
    Wrapped<double?>? sortOrder,
    Wrapped<bool?>? isActive,
  }) {
    return UpdateCategoryDto(
      name: (name != null ? name.value : this.name),
      slug: (slug != null ? slug.value : this.slug),
      nameTa: (nameTa != null ? nameTa.value : this.nameTa),
      icon: (icon != null ? icon.value : this.icon),
      imageUrl: (imageUrl != null ? imageUrl.value : this.imageUrl),
      sortOrder: (sortOrder != null ? sortOrder.value : this.sortOrder),
      isActive: (isActive != null ? isActive.value : this.isActive),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class CreateProductDto {
  const CreateProductDto({
    required this.sku,
    required this.barcodes,
    required this.name,
    this.nameTa,
    this.description,
    required this.categoryId,
    required this.unit,
    required this.costPrice,
    required this.baseSellingPrice,
    this.isActive,
  });

  factory CreateProductDto.fromJson(Map<String, dynamic> json) =>
      _$CreateProductDtoFromJson(json);

  static const toJsonFactory = _$CreateProductDtoToJson;
  Map<String, dynamic> toJson() => _$CreateProductDtoToJson(this);

  @JsonKey(name: 'sku')
  final String sku;
  @JsonKey(name: 'barcodes', defaultValue: <String>[])
  final List<String> barcodes;
  @JsonKey(name: 'name')
  final String name;
  @JsonKey(name: 'nameTa')
  final String? nameTa;
  @JsonKey(name: 'description')
  final String? description;
  @JsonKey(name: 'categoryId')
  final String categoryId;
  @JsonKey(name: 'unit')
  final String unit;
  @JsonKey(name: 'costPrice')
  final double costPrice;
  @JsonKey(name: 'baseSellingPrice')
  final double baseSellingPrice;
  @JsonKey(name: 'isActive', defaultValue: true)
  final bool? isActive;
  static const fromJsonFactory = _$CreateProductDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is CreateProductDto &&
            (identical(other.sku, sku) ||
                const DeepCollectionEquality().equals(other.sku, sku)) &&
            (identical(other.barcodes, barcodes) ||
                const DeepCollectionEquality().equals(
                  other.barcodes,
                  barcodes,
                )) &&
            (identical(other.name, name) ||
                const DeepCollectionEquality().equals(other.name, name)) &&
            (identical(other.nameTa, nameTa) ||
                const DeepCollectionEquality().equals(other.nameTa, nameTa)) &&
            (identical(other.description, description) ||
                const DeepCollectionEquality().equals(
                  other.description,
                  description,
                )) &&
            (identical(other.categoryId, categoryId) ||
                const DeepCollectionEquality().equals(
                  other.categoryId,
                  categoryId,
                )) &&
            (identical(other.unit, unit) ||
                const DeepCollectionEquality().equals(other.unit, unit)) &&
            (identical(other.costPrice, costPrice) ||
                const DeepCollectionEquality().equals(
                  other.costPrice,
                  costPrice,
                )) &&
            (identical(other.baseSellingPrice, baseSellingPrice) ||
                const DeepCollectionEquality().equals(
                  other.baseSellingPrice,
                  baseSellingPrice,
                )) &&
            (identical(other.isActive, isActive) ||
                const DeepCollectionEquality().equals(
                  other.isActive,
                  isActive,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(sku) ^
      const DeepCollectionEquality().hash(barcodes) ^
      const DeepCollectionEquality().hash(name) ^
      const DeepCollectionEquality().hash(nameTa) ^
      const DeepCollectionEquality().hash(description) ^
      const DeepCollectionEquality().hash(categoryId) ^
      const DeepCollectionEquality().hash(unit) ^
      const DeepCollectionEquality().hash(costPrice) ^
      const DeepCollectionEquality().hash(baseSellingPrice) ^
      const DeepCollectionEquality().hash(isActive) ^
      runtimeType.hashCode;
}

extension $CreateProductDtoExtension on CreateProductDto {
  CreateProductDto copyWith({
    String? sku,
    List<String>? barcodes,
    String? name,
    String? nameTa,
    String? description,
    String? categoryId,
    String? unit,
    double? costPrice,
    double? baseSellingPrice,
    bool? isActive,
  }) {
    return CreateProductDto(
      sku: sku ?? this.sku,
      barcodes: barcodes ?? this.barcodes,
      name: name ?? this.name,
      nameTa: nameTa ?? this.nameTa,
      description: description ?? this.description,
      categoryId: categoryId ?? this.categoryId,
      unit: unit ?? this.unit,
      costPrice: costPrice ?? this.costPrice,
      baseSellingPrice: baseSellingPrice ?? this.baseSellingPrice,
      isActive: isActive ?? this.isActive,
    );
  }

  CreateProductDto copyWithWrapped({
    Wrapped<String>? sku,
    Wrapped<List<String>>? barcodes,
    Wrapped<String>? name,
    Wrapped<String?>? nameTa,
    Wrapped<String?>? description,
    Wrapped<String>? categoryId,
    Wrapped<String>? unit,
    Wrapped<double>? costPrice,
    Wrapped<double>? baseSellingPrice,
    Wrapped<bool?>? isActive,
  }) {
    return CreateProductDto(
      sku: (sku != null ? sku.value : this.sku),
      barcodes: (barcodes != null ? barcodes.value : this.barcodes),
      name: (name != null ? name.value : this.name),
      nameTa: (nameTa != null ? nameTa.value : this.nameTa),
      description: (description != null ? description.value : this.description),
      categoryId: (categoryId != null ? categoryId.value : this.categoryId),
      unit: (unit != null ? unit.value : this.unit),
      costPrice: (costPrice != null ? costPrice.value : this.costPrice),
      baseSellingPrice: (baseSellingPrice != null
          ? baseSellingPrice.value
          : this.baseSellingPrice),
      isActive: (isActive != null ? isActive.value : this.isActive),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class UpdateProductDto {
  const UpdateProductDto({
    this.sku,
    this.barcodes,
    this.name,
    this.nameTa,
    this.description,
    this.categoryId,
    this.unit,
    this.costPrice,
    this.baseSellingPrice,
    this.isActive,
  });

  factory UpdateProductDto.fromJson(Map<String, dynamic> json) =>
      _$UpdateProductDtoFromJson(json);

  static const toJsonFactory = _$UpdateProductDtoToJson;
  Map<String, dynamic> toJson() => _$UpdateProductDtoToJson(this);

  @JsonKey(name: 'sku')
  final String? sku;
  @JsonKey(name: 'barcodes', defaultValue: <String>[])
  final List<String>? barcodes;
  @JsonKey(name: 'name')
  final String? name;
  @JsonKey(name: 'nameTa')
  final String? nameTa;
  @JsonKey(name: 'description')
  final String? description;
  @JsonKey(name: 'categoryId')
  final String? categoryId;
  @JsonKey(name: 'unit')
  final String? unit;
  @JsonKey(name: 'costPrice')
  final double? costPrice;
  @JsonKey(name: 'baseSellingPrice')
  final double? baseSellingPrice;
  @JsonKey(name: 'isActive', defaultValue: true)
  final bool? isActive;
  static const fromJsonFactory = _$UpdateProductDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is UpdateProductDto &&
            (identical(other.sku, sku) ||
                const DeepCollectionEquality().equals(other.sku, sku)) &&
            (identical(other.barcodes, barcodes) ||
                const DeepCollectionEquality().equals(
                  other.barcodes,
                  barcodes,
                )) &&
            (identical(other.name, name) ||
                const DeepCollectionEquality().equals(other.name, name)) &&
            (identical(other.nameTa, nameTa) ||
                const DeepCollectionEquality().equals(other.nameTa, nameTa)) &&
            (identical(other.description, description) ||
                const DeepCollectionEquality().equals(
                  other.description,
                  description,
                )) &&
            (identical(other.categoryId, categoryId) ||
                const DeepCollectionEquality().equals(
                  other.categoryId,
                  categoryId,
                )) &&
            (identical(other.unit, unit) ||
                const DeepCollectionEquality().equals(other.unit, unit)) &&
            (identical(other.costPrice, costPrice) ||
                const DeepCollectionEquality().equals(
                  other.costPrice,
                  costPrice,
                )) &&
            (identical(other.baseSellingPrice, baseSellingPrice) ||
                const DeepCollectionEquality().equals(
                  other.baseSellingPrice,
                  baseSellingPrice,
                )) &&
            (identical(other.isActive, isActive) ||
                const DeepCollectionEquality().equals(
                  other.isActive,
                  isActive,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(sku) ^
      const DeepCollectionEquality().hash(barcodes) ^
      const DeepCollectionEquality().hash(name) ^
      const DeepCollectionEquality().hash(nameTa) ^
      const DeepCollectionEquality().hash(description) ^
      const DeepCollectionEquality().hash(categoryId) ^
      const DeepCollectionEquality().hash(unit) ^
      const DeepCollectionEquality().hash(costPrice) ^
      const DeepCollectionEquality().hash(baseSellingPrice) ^
      const DeepCollectionEquality().hash(isActive) ^
      runtimeType.hashCode;
}

extension $UpdateProductDtoExtension on UpdateProductDto {
  UpdateProductDto copyWith({
    String? sku,
    List<String>? barcodes,
    String? name,
    String? nameTa,
    String? description,
    String? categoryId,
    String? unit,
    double? costPrice,
    double? baseSellingPrice,
    bool? isActive,
  }) {
    return UpdateProductDto(
      sku: sku ?? this.sku,
      barcodes: barcodes ?? this.barcodes,
      name: name ?? this.name,
      nameTa: nameTa ?? this.nameTa,
      description: description ?? this.description,
      categoryId: categoryId ?? this.categoryId,
      unit: unit ?? this.unit,
      costPrice: costPrice ?? this.costPrice,
      baseSellingPrice: baseSellingPrice ?? this.baseSellingPrice,
      isActive: isActive ?? this.isActive,
    );
  }

  UpdateProductDto copyWithWrapped({
    Wrapped<String?>? sku,
    Wrapped<List<String>?>? barcodes,
    Wrapped<String?>? name,
    Wrapped<String?>? nameTa,
    Wrapped<String?>? description,
    Wrapped<String?>? categoryId,
    Wrapped<String?>? unit,
    Wrapped<double?>? costPrice,
    Wrapped<double?>? baseSellingPrice,
    Wrapped<bool?>? isActive,
  }) {
    return UpdateProductDto(
      sku: (sku != null ? sku.value : this.sku),
      barcodes: (barcodes != null ? barcodes.value : this.barcodes),
      name: (name != null ? name.value : this.name),
      nameTa: (nameTa != null ? nameTa.value : this.nameTa),
      description: (description != null ? description.value : this.description),
      categoryId: (categoryId != null ? categoryId.value : this.categoryId),
      unit: (unit != null ? unit.value : this.unit),
      costPrice: (costPrice != null ? costPrice.value : this.costPrice),
      baseSellingPrice: (baseSellingPrice != null
          ? baseSellingPrice.value
          : this.baseSellingPrice),
      isActive: (isActive != null ? isActive.value : this.isActive),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class AdjustStockDto {
  const AdjustStockDto({required this.quantityDelta, required this.reason});

  factory AdjustStockDto.fromJson(Map<String, dynamic> json) =>
      _$AdjustStockDtoFromJson(json);

  static const toJsonFactory = _$AdjustStockDtoToJson;
  Map<String, dynamic> toJson() => _$AdjustStockDtoToJson(this);

  @JsonKey(name: 'quantityDelta')
  final double quantityDelta;
  @JsonKey(name: 'reason')
  final String reason;
  static const fromJsonFactory = _$AdjustStockDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is AdjustStockDto &&
            (identical(other.quantityDelta, quantityDelta) ||
                const DeepCollectionEquality().equals(
                  other.quantityDelta,
                  quantityDelta,
                )) &&
            (identical(other.reason, reason) ||
                const DeepCollectionEquality().equals(other.reason, reason)));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(quantityDelta) ^
      const DeepCollectionEquality().hash(reason) ^
      runtimeType.hashCode;
}

extension $AdjustStockDtoExtension on AdjustStockDto {
  AdjustStockDto copyWith({double? quantityDelta, String? reason}) {
    return AdjustStockDto(
      quantityDelta: quantityDelta ?? this.quantityDelta,
      reason: reason ?? this.reason,
    );
  }

  AdjustStockDto copyWithWrapped({
    Wrapped<double>? quantityDelta,
    Wrapped<String>? reason,
  }) {
    return AdjustStockDto(
      quantityDelta: (quantityDelta != null
          ? quantityDelta.value
          : this.quantityDelta),
      reason: (reason != null ? reason.value : this.reason),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class UpdateReorderLevelDto {
  const UpdateReorderLevelDto({required this.reorderLevel});

  factory UpdateReorderLevelDto.fromJson(Map<String, dynamic> json) =>
      _$UpdateReorderLevelDtoFromJson(json);

  static const toJsonFactory = _$UpdateReorderLevelDtoToJson;
  Map<String, dynamic> toJson() => _$UpdateReorderLevelDtoToJson(this);

  @JsonKey(name: 'reorderLevel')
  final double reorderLevel;
  static const fromJsonFactory = _$UpdateReorderLevelDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is UpdateReorderLevelDto &&
            (identical(other.reorderLevel, reorderLevel) ||
                const DeepCollectionEquality().equals(
                  other.reorderLevel,
                  reorderLevel,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(reorderLevel) ^ runtimeType.hashCode;
}

extension $UpdateReorderLevelDtoExtension on UpdateReorderLevelDto {
  UpdateReorderLevelDto copyWith({double? reorderLevel}) {
    return UpdateReorderLevelDto(
      reorderLevel: reorderLevel ?? this.reorderLevel,
    );
  }

  UpdateReorderLevelDto copyWithWrapped({Wrapped<double>? reorderLevel}) {
    return UpdateReorderLevelDto(
      reorderLevel: (reorderLevel != null
          ? reorderLevel.value
          : this.reorderLevel),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class UpdateStoreCatalogDto {
  const UpdateStoreCatalogDto({
    this.customPrice,
    this.isAvailable,
    this.reorderLevel,
  });

  factory UpdateStoreCatalogDto.fromJson(Map<String, dynamic> json) =>
      _$UpdateStoreCatalogDtoFromJson(json);

  static const toJsonFactory = _$UpdateStoreCatalogDtoToJson;
  Map<String, dynamic> toJson() => _$UpdateStoreCatalogDtoToJson(this);

  @JsonKey(name: 'customPrice')
  final Object? customPrice;
  @JsonKey(name: 'isAvailable')
  final bool? isAvailable;
  @JsonKey(name: 'reorderLevel')
  final double? reorderLevel;
  static const fromJsonFactory = _$UpdateStoreCatalogDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is UpdateStoreCatalogDto &&
            (identical(other.customPrice, customPrice) ||
                const DeepCollectionEquality().equals(
                  other.customPrice,
                  customPrice,
                )) &&
            (identical(other.isAvailable, isAvailable) ||
                const DeepCollectionEquality().equals(
                  other.isAvailable,
                  isAvailable,
                )) &&
            (identical(other.reorderLevel, reorderLevel) ||
                const DeepCollectionEquality().equals(
                  other.reorderLevel,
                  reorderLevel,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(customPrice) ^
      const DeepCollectionEquality().hash(isAvailable) ^
      const DeepCollectionEquality().hash(reorderLevel) ^
      runtimeType.hashCode;
}

extension $UpdateStoreCatalogDtoExtension on UpdateStoreCatalogDto {
  UpdateStoreCatalogDto copyWith({
    Object? customPrice,
    bool? isAvailable,
    double? reorderLevel,
  }) {
    return UpdateStoreCatalogDto(
      customPrice: customPrice ?? this.customPrice,
      isAvailable: isAvailable ?? this.isAvailable,
      reorderLevel: reorderLevel ?? this.reorderLevel,
    );
  }

  UpdateStoreCatalogDto copyWithWrapped({
    Wrapped<Object?>? customPrice,
    Wrapped<bool?>? isAvailable,
    Wrapped<double?>? reorderLevel,
  }) {
    return UpdateStoreCatalogDto(
      customPrice: (customPrice != null ? customPrice.value : this.customPrice),
      isAvailable: (isAvailable != null ? isAvailable.value : this.isAvailable),
      reorderLevel: (reorderLevel != null
          ? reorderLevel.value
          : this.reorderLevel),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class TransferLineDto {
  const TransferLineDto({
    required this.productId,
    required this.requestedQuantity,
  });

  factory TransferLineDto.fromJson(Map<String, dynamic> json) =>
      _$TransferLineDtoFromJson(json);

  static const toJsonFactory = _$TransferLineDtoToJson;
  Map<String, dynamic> toJson() => _$TransferLineDtoToJson(this);

  @JsonKey(name: 'productId')
  final String productId;
  @JsonKey(name: 'requestedQuantity')
  final double requestedQuantity;
  static const fromJsonFactory = _$TransferLineDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is TransferLineDto &&
            (identical(other.productId, productId) ||
                const DeepCollectionEquality().equals(
                  other.productId,
                  productId,
                )) &&
            (identical(other.requestedQuantity, requestedQuantity) ||
                const DeepCollectionEquality().equals(
                  other.requestedQuantity,
                  requestedQuantity,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(productId) ^
      const DeepCollectionEquality().hash(requestedQuantity) ^
      runtimeType.hashCode;
}

extension $TransferLineDtoExtension on TransferLineDto {
  TransferLineDto copyWith({String? productId, double? requestedQuantity}) {
    return TransferLineDto(
      productId: productId ?? this.productId,
      requestedQuantity: requestedQuantity ?? this.requestedQuantity,
    );
  }

  TransferLineDto copyWithWrapped({
    Wrapped<String>? productId,
    Wrapped<double>? requestedQuantity,
  }) {
    return TransferLineDto(
      productId: (productId != null ? productId.value : this.productId),
      requestedQuantity: (requestedQuantity != null
          ? requestedQuantity.value
          : this.requestedQuantity),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class CreateTransferDto {
  const CreateTransferDto({required this.storeId, required this.items});

  factory CreateTransferDto.fromJson(Map<String, dynamic> json) =>
      _$CreateTransferDtoFromJson(json);

  static const toJsonFactory = _$CreateTransferDtoToJson;
  Map<String, dynamic> toJson() => _$CreateTransferDtoToJson(this);

  @JsonKey(name: 'storeId')
  final String storeId;
  @JsonKey(name: 'items', defaultValue: <TransferLineDto>[])
  final List<TransferLineDto> items;
  static const fromJsonFactory = _$CreateTransferDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is CreateTransferDto &&
            (identical(other.storeId, storeId) ||
                const DeepCollectionEquality().equals(
                  other.storeId,
                  storeId,
                )) &&
            (identical(other.items, items) ||
                const DeepCollectionEquality().equals(other.items, items)));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(storeId) ^
      const DeepCollectionEquality().hash(items) ^
      runtimeType.hashCode;
}

extension $CreateTransferDtoExtension on CreateTransferDto {
  CreateTransferDto copyWith({String? storeId, List<TransferLineDto>? items}) {
    return CreateTransferDto(
      storeId: storeId ?? this.storeId,
      items: items ?? this.items,
    );
  }

  CreateTransferDto copyWithWrapped({
    Wrapped<String>? storeId,
    Wrapped<List<TransferLineDto>>? items,
  }) {
    return CreateTransferDto(
      storeId: (storeId != null ? storeId.value : this.storeId),
      items: (items != null ? items.value : this.items),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class ReceiveTransferLineDto {
  const ReceiveTransferLineDto({
    required this.productId,
    required this.receivedQuantity,
    this.notes,
  });

  factory ReceiveTransferLineDto.fromJson(Map<String, dynamic> json) =>
      _$ReceiveTransferLineDtoFromJson(json);

  static const toJsonFactory = _$ReceiveTransferLineDtoToJson;
  Map<String, dynamic> toJson() => _$ReceiveTransferLineDtoToJson(this);

  @JsonKey(name: 'productId')
  final String productId;
  @JsonKey(name: 'receivedQuantity')
  final double receivedQuantity;
  @JsonKey(name: 'notes')
  final String? notes;
  static const fromJsonFactory = _$ReceiveTransferLineDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is ReceiveTransferLineDto &&
            (identical(other.productId, productId) ||
                const DeepCollectionEquality().equals(
                  other.productId,
                  productId,
                )) &&
            (identical(other.receivedQuantity, receivedQuantity) ||
                const DeepCollectionEquality().equals(
                  other.receivedQuantity,
                  receivedQuantity,
                )) &&
            (identical(other.notes, notes) ||
                const DeepCollectionEquality().equals(other.notes, notes)));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(productId) ^
      const DeepCollectionEquality().hash(receivedQuantity) ^
      const DeepCollectionEquality().hash(notes) ^
      runtimeType.hashCode;
}

extension $ReceiveTransferLineDtoExtension on ReceiveTransferLineDto {
  ReceiveTransferLineDto copyWith({
    String? productId,
    double? receivedQuantity,
    String? notes,
  }) {
    return ReceiveTransferLineDto(
      productId: productId ?? this.productId,
      receivedQuantity: receivedQuantity ?? this.receivedQuantity,
      notes: notes ?? this.notes,
    );
  }

  ReceiveTransferLineDto copyWithWrapped({
    Wrapped<String>? productId,
    Wrapped<double>? receivedQuantity,
    Wrapped<String?>? notes,
  }) {
    return ReceiveTransferLineDto(
      productId: (productId != null ? productId.value : this.productId),
      receivedQuantity: (receivedQuantity != null
          ? receivedQuantity.value
          : this.receivedQuantity),
      notes: (notes != null ? notes.value : this.notes),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class ReceiveTransferDto {
  const ReceiveTransferDto({required this.items});

  factory ReceiveTransferDto.fromJson(Map<String, dynamic> json) =>
      _$ReceiveTransferDtoFromJson(json);

  static const toJsonFactory = _$ReceiveTransferDtoToJson;
  Map<String, dynamic> toJson() => _$ReceiveTransferDtoToJson(this);

  @JsonKey(name: 'items', defaultValue: <ReceiveTransferLineDto>[])
  final List<ReceiveTransferLineDto> items;
  static const fromJsonFactory = _$ReceiveTransferDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is ReceiveTransferDto &&
            (identical(other.items, items) ||
                const DeepCollectionEquality().equals(other.items, items)));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(items) ^ runtimeType.hashCode;
}

extension $ReceiveTransferDtoExtension on ReceiveTransferDto {
  ReceiveTransferDto copyWith({List<ReceiveTransferLineDto>? items}) {
    return ReceiveTransferDto(items: items ?? this.items);
  }

  ReceiveTransferDto copyWithWrapped({
    Wrapped<List<ReceiveTransferLineDto>>? items,
  }) {
    return ReceiveTransferDto(
      items: (items != null ? items.value : this.items),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class ResolveTransferLineDto {
  const ResolveTransferLineDto({
    required this.productId,
    required this.resolution,
  });

  factory ResolveTransferLineDto.fromJson(Map<String, dynamic> json) =>
      _$ResolveTransferLineDtoFromJson(json);

  static const toJsonFactory = _$ResolveTransferLineDtoToJson;
  Map<String, dynamic> toJson() => _$ResolveTransferLineDtoToJson(this);

  @JsonKey(name: 'productId')
  final String productId;
  @JsonKey(
    name: 'resolution',
    toJson: resolveTransferLineDtoResolutionToJson,
    fromJson: resolveTransferLineDtoResolutionFromJson,
  )
  final enums.ResolveTransferLineDtoResolution resolution;
  static const fromJsonFactory = _$ResolveTransferLineDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is ResolveTransferLineDto &&
            (identical(other.productId, productId) ||
                const DeepCollectionEquality().equals(
                  other.productId,
                  productId,
                )) &&
            (identical(other.resolution, resolution) ||
                const DeepCollectionEquality().equals(
                  other.resolution,
                  resolution,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(productId) ^
      const DeepCollectionEquality().hash(resolution) ^
      runtimeType.hashCode;
}

extension $ResolveTransferLineDtoExtension on ResolveTransferLineDto {
  ResolveTransferLineDto copyWith({
    String? productId,
    enums.ResolveTransferLineDtoResolution? resolution,
  }) {
    return ResolveTransferLineDto(
      productId: productId ?? this.productId,
      resolution: resolution ?? this.resolution,
    );
  }

  ResolveTransferLineDto copyWithWrapped({
    Wrapped<String>? productId,
    Wrapped<enums.ResolveTransferLineDtoResolution>? resolution,
  }) {
    return ResolveTransferLineDto(
      productId: (productId != null ? productId.value : this.productId),
      resolution: (resolution != null ? resolution.value : this.resolution),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class ResolveTransferDto {
  const ResolveTransferDto({required this.resolutionNote, required this.items});

  factory ResolveTransferDto.fromJson(Map<String, dynamic> json) =>
      _$ResolveTransferDtoFromJson(json);

  static const toJsonFactory = _$ResolveTransferDtoToJson;
  Map<String, dynamic> toJson() => _$ResolveTransferDtoToJson(this);

  @JsonKey(name: 'resolutionNote')
  final String resolutionNote;
  @JsonKey(name: 'items', defaultValue: <ResolveTransferLineDto>[])
  final List<ResolveTransferLineDto> items;
  static const fromJsonFactory = _$ResolveTransferDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is ResolveTransferDto &&
            (identical(other.resolutionNote, resolutionNote) ||
                const DeepCollectionEquality().equals(
                  other.resolutionNote,
                  resolutionNote,
                )) &&
            (identical(other.items, items) ||
                const DeepCollectionEquality().equals(other.items, items)));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(resolutionNote) ^
      const DeepCollectionEquality().hash(items) ^
      runtimeType.hashCode;
}

extension $ResolveTransferDtoExtension on ResolveTransferDto {
  ResolveTransferDto copyWith({
    String? resolutionNote,
    List<ResolveTransferLineDto>? items,
  }) {
    return ResolveTransferDto(
      resolutionNote: resolutionNote ?? this.resolutionNote,
      items: items ?? this.items,
    );
  }

  ResolveTransferDto copyWithWrapped({
    Wrapped<String>? resolutionNote,
    Wrapped<List<ResolveTransferLineDto>>? items,
  }) {
    return ResolveTransferDto(
      resolutionNote: (resolutionNote != null
          ? resolutionNote.value
          : this.resolutionNote),
      items: (items != null ? items.value : this.items),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class CreateOrderItemDto {
  const CreateOrderItemDto({
    required this.storeProductId,
    required this.quantity,
  });

  factory CreateOrderItemDto.fromJson(Map<String, dynamic> json) =>
      _$CreateOrderItemDtoFromJson(json);

  static const toJsonFactory = _$CreateOrderItemDtoToJson;
  Map<String, dynamic> toJson() => _$CreateOrderItemDtoToJson(this);

  @JsonKey(name: 'storeProductId')
  final String storeProductId;
  @JsonKey(name: 'quantity')
  final double quantity;
  static const fromJsonFactory = _$CreateOrderItemDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is CreateOrderItemDto &&
            (identical(other.storeProductId, storeProductId) ||
                const DeepCollectionEquality().equals(
                  other.storeProductId,
                  storeProductId,
                )) &&
            (identical(other.quantity, quantity) ||
                const DeepCollectionEquality().equals(
                  other.quantity,
                  quantity,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(storeProductId) ^
      const DeepCollectionEquality().hash(quantity) ^
      runtimeType.hashCode;
}

extension $CreateOrderItemDtoExtension on CreateOrderItemDto {
  CreateOrderItemDto copyWith({String? storeProductId, double? quantity}) {
    return CreateOrderItemDto(
      storeProductId: storeProductId ?? this.storeProductId,
      quantity: quantity ?? this.quantity,
    );
  }

  CreateOrderItemDto copyWithWrapped({
    Wrapped<String>? storeProductId,
    Wrapped<double>? quantity,
  }) {
    return CreateOrderItemDto(
      storeProductId: (storeProductId != null
          ? storeProductId.value
          : this.storeProductId),
      quantity: (quantity != null ? quantity.value : this.quantity),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class CreateOrderDto {
  const CreateOrderDto({
    required this.storeId,
    required this.deliveryAddressId,
    this.deliveryZoneId,
    this.campaignCodes,
    required this.items,
  });

  factory CreateOrderDto.fromJson(Map<String, dynamic> json) =>
      _$CreateOrderDtoFromJson(json);

  static const toJsonFactory = _$CreateOrderDtoToJson;
  Map<String, dynamic> toJson() => _$CreateOrderDtoToJson(this);

  @JsonKey(name: 'storeId')
  final String storeId;
  @JsonKey(name: 'deliveryAddressId')
  final String deliveryAddressId;
  @JsonKey(name: 'deliveryZoneId')
  final String? deliveryZoneId;
  @JsonKey(name: 'campaignCodes', defaultValue: <String>[])
  final List<String>? campaignCodes;
  @JsonKey(name: 'items', defaultValue: <CreateOrderItemDto>[])
  final List<CreateOrderItemDto> items;
  static const fromJsonFactory = _$CreateOrderDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is CreateOrderDto &&
            (identical(other.storeId, storeId) ||
                const DeepCollectionEquality().equals(
                  other.storeId,
                  storeId,
                )) &&
            (identical(other.deliveryAddressId, deliveryAddressId) ||
                const DeepCollectionEquality().equals(
                  other.deliveryAddressId,
                  deliveryAddressId,
                )) &&
            (identical(other.deliveryZoneId, deliveryZoneId) ||
                const DeepCollectionEquality().equals(
                  other.deliveryZoneId,
                  deliveryZoneId,
                )) &&
            (identical(other.campaignCodes, campaignCodes) ||
                const DeepCollectionEquality().equals(
                  other.campaignCodes,
                  campaignCodes,
                )) &&
            (identical(other.items, items) ||
                const DeepCollectionEquality().equals(other.items, items)));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(storeId) ^
      const DeepCollectionEquality().hash(deliveryAddressId) ^
      const DeepCollectionEquality().hash(deliveryZoneId) ^
      const DeepCollectionEquality().hash(campaignCodes) ^
      const DeepCollectionEquality().hash(items) ^
      runtimeType.hashCode;
}

extension $CreateOrderDtoExtension on CreateOrderDto {
  CreateOrderDto copyWith({
    String? storeId,
    String? deliveryAddressId,
    String? deliveryZoneId,
    List<String>? campaignCodes,
    List<CreateOrderItemDto>? items,
  }) {
    return CreateOrderDto(
      storeId: storeId ?? this.storeId,
      deliveryAddressId: deliveryAddressId ?? this.deliveryAddressId,
      deliveryZoneId: deliveryZoneId ?? this.deliveryZoneId,
      campaignCodes: campaignCodes ?? this.campaignCodes,
      items: items ?? this.items,
    );
  }

  CreateOrderDto copyWithWrapped({
    Wrapped<String>? storeId,
    Wrapped<String>? deliveryAddressId,
    Wrapped<String?>? deliveryZoneId,
    Wrapped<List<String>?>? campaignCodes,
    Wrapped<List<CreateOrderItemDto>>? items,
  }) {
    return CreateOrderDto(
      storeId: (storeId != null ? storeId.value : this.storeId),
      deliveryAddressId: (deliveryAddressId != null
          ? deliveryAddressId.value
          : this.deliveryAddressId),
      deliveryZoneId: (deliveryZoneId != null
          ? deliveryZoneId.value
          : this.deliveryZoneId),
      campaignCodes: (campaignCodes != null
          ? campaignCodes.value
          : this.campaignCodes),
      items: (items != null ? items.value : this.items),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class CheckoutOrderDto {
  const CheckoutOrderDto({
    required this.storeId,
    required this.deliveryAddressId,
    this.deliveryZoneId,
    this.campaignCodes,
  });

  factory CheckoutOrderDto.fromJson(Map<String, dynamic> json) =>
      _$CheckoutOrderDtoFromJson(json);

  static const toJsonFactory = _$CheckoutOrderDtoToJson;
  Map<String, dynamic> toJson() => _$CheckoutOrderDtoToJson(this);

  @JsonKey(name: 'storeId')
  final String storeId;
  @JsonKey(name: 'deliveryAddressId')
  final String deliveryAddressId;
  @JsonKey(name: 'deliveryZoneId')
  final String? deliveryZoneId;
  @JsonKey(name: 'campaignCodes', defaultValue: <String>[])
  final List<String>? campaignCodes;
  static const fromJsonFactory = _$CheckoutOrderDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is CheckoutOrderDto &&
            (identical(other.storeId, storeId) ||
                const DeepCollectionEquality().equals(
                  other.storeId,
                  storeId,
                )) &&
            (identical(other.deliveryAddressId, deliveryAddressId) ||
                const DeepCollectionEquality().equals(
                  other.deliveryAddressId,
                  deliveryAddressId,
                )) &&
            (identical(other.deliveryZoneId, deliveryZoneId) ||
                const DeepCollectionEquality().equals(
                  other.deliveryZoneId,
                  deliveryZoneId,
                )) &&
            (identical(other.campaignCodes, campaignCodes) ||
                const DeepCollectionEquality().equals(
                  other.campaignCodes,
                  campaignCodes,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(storeId) ^
      const DeepCollectionEquality().hash(deliveryAddressId) ^
      const DeepCollectionEquality().hash(deliveryZoneId) ^
      const DeepCollectionEquality().hash(campaignCodes) ^
      runtimeType.hashCode;
}

extension $CheckoutOrderDtoExtension on CheckoutOrderDto {
  CheckoutOrderDto copyWith({
    String? storeId,
    String? deliveryAddressId,
    String? deliveryZoneId,
    List<String>? campaignCodes,
  }) {
    return CheckoutOrderDto(
      storeId: storeId ?? this.storeId,
      deliveryAddressId: deliveryAddressId ?? this.deliveryAddressId,
      deliveryZoneId: deliveryZoneId ?? this.deliveryZoneId,
      campaignCodes: campaignCodes ?? this.campaignCodes,
    );
  }

  CheckoutOrderDto copyWithWrapped({
    Wrapped<String>? storeId,
    Wrapped<String>? deliveryAddressId,
    Wrapped<String?>? deliveryZoneId,
    Wrapped<List<String>?>? campaignCodes,
  }) {
    return CheckoutOrderDto(
      storeId: (storeId != null ? storeId.value : this.storeId),
      deliveryAddressId: (deliveryAddressId != null
          ? deliveryAddressId.value
          : this.deliveryAddressId),
      deliveryZoneId: (deliveryZoneId != null
          ? deliveryZoneId.value
          : this.deliveryZoneId),
      campaignCodes: (campaignCodes != null
          ? campaignCodes.value
          : this.campaignCodes),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class OrderReasonDto {
  const OrderReasonDto({required this.reason});

  factory OrderReasonDto.fromJson(Map<String, dynamic> json) =>
      _$OrderReasonDtoFromJson(json);

  static const toJsonFactory = _$OrderReasonDtoToJson;
  Map<String, dynamic> toJson() => _$OrderReasonDtoToJson(this);

  @JsonKey(name: 'reason')
  final String reason;
  static const fromJsonFactory = _$OrderReasonDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is OrderReasonDto &&
            (identical(other.reason, reason) ||
                const DeepCollectionEquality().equals(other.reason, reason)));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(reason) ^ runtimeType.hashCode;
}

extension $OrderReasonDtoExtension on OrderReasonDto {
  OrderReasonDto copyWith({String? reason}) {
    return OrderReasonDto(reason: reason ?? this.reason);
  }

  OrderReasonDto copyWithWrapped({Wrapped<String>? reason}) {
    return OrderReasonDto(
      reason: (reason != null ? reason.value : this.reason),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class OrderNoteDto {
  const OrderNoteDto({this.note});

  factory OrderNoteDto.fromJson(Map<String, dynamic> json) =>
      _$OrderNoteDtoFromJson(json);

  static const toJsonFactory = _$OrderNoteDtoToJson;
  Map<String, dynamic> toJson() => _$OrderNoteDtoToJson(this);

  @JsonKey(name: 'note')
  final String? note;
  static const fromJsonFactory = _$OrderNoteDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is OrderNoteDto &&
            (identical(other.note, note) ||
                const DeepCollectionEquality().equals(other.note, note)));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(note) ^ runtimeType.hashCode;
}

extension $OrderNoteDtoExtension on OrderNoteDto {
  OrderNoteDto copyWith({String? note}) {
    return OrderNoteDto(note: note ?? this.note);
  }

  OrderNoteDto copyWithWrapped({Wrapped<String?>? note}) {
    return OrderNoteDto(note: (note != null ? note.value : this.note));
  }
}

@JsonSerializable(explicitToJson: true)
class AssignOrderRiderDto {
  const AssignOrderRiderDto({required this.riderId});

  factory AssignOrderRiderDto.fromJson(Map<String, dynamic> json) =>
      _$AssignOrderRiderDtoFromJson(json);

  static const toJsonFactory = _$AssignOrderRiderDtoToJson;
  Map<String, dynamic> toJson() => _$AssignOrderRiderDtoToJson(this);

  @JsonKey(name: 'riderId')
  final String riderId;
  static const fromJsonFactory = _$AssignOrderRiderDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is AssignOrderRiderDto &&
            (identical(other.riderId, riderId) ||
                const DeepCollectionEquality().equals(other.riderId, riderId)));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(riderId) ^ runtimeType.hashCode;
}

extension $AssignOrderRiderDtoExtension on AssignOrderRiderDto {
  AssignOrderRiderDto copyWith({String? riderId}) {
    return AssignOrderRiderDto(riderId: riderId ?? this.riderId);
  }

  AssignOrderRiderDto copyWithWrapped({Wrapped<String>? riderId}) {
    return AssignOrderRiderDto(
      riderId: (riderId != null ? riderId.value : this.riderId),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class DeliverOrderDto {
  const DeliverOrderDto({required this.collectedAmount});

  factory DeliverOrderDto.fromJson(Map<String, dynamic> json) =>
      _$DeliverOrderDtoFromJson(json);

  static const toJsonFactory = _$DeliverOrderDtoToJson;
  Map<String, dynamic> toJson() => _$DeliverOrderDtoToJson(this);

  @JsonKey(name: 'collectedAmount')
  final double collectedAmount;
  static const fromJsonFactory = _$DeliverOrderDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is DeliverOrderDto &&
            (identical(other.collectedAmount, collectedAmount) ||
                const DeepCollectionEquality().equals(
                  other.collectedAmount,
                  collectedAmount,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(collectedAmount) ^
      runtimeType.hashCode;
}

extension $DeliverOrderDtoExtension on DeliverOrderDto {
  DeliverOrderDto copyWith({double? collectedAmount}) {
    return DeliverOrderDto(
      collectedAmount: collectedAmount ?? this.collectedAmount,
    );
  }

  DeliverOrderDto copyWithWrapped({Wrapped<double>? collectedAmount}) {
    return DeliverOrderDto(
      collectedAmount: (collectedAmount != null
          ? collectedAmount.value
          : this.collectedAmount),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class CartItemInputDto {
  const CartItemInputDto({
    required this.storeProductId,
    required this.quantity,
  });

  factory CartItemInputDto.fromJson(Map<String, dynamic> json) =>
      _$CartItemInputDtoFromJson(json);

  static const toJsonFactory = _$CartItemInputDtoToJson;
  Map<String, dynamic> toJson() => _$CartItemInputDtoToJson(this);

  @JsonKey(name: 'storeProductId')
  final String storeProductId;
  @JsonKey(name: 'quantity')
  final double quantity;
  static const fromJsonFactory = _$CartItemInputDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is CartItemInputDto &&
            (identical(other.storeProductId, storeProductId) ||
                const DeepCollectionEquality().equals(
                  other.storeProductId,
                  storeProductId,
                )) &&
            (identical(other.quantity, quantity) ||
                const DeepCollectionEquality().equals(
                  other.quantity,
                  quantity,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(storeProductId) ^
      const DeepCollectionEquality().hash(quantity) ^
      runtimeType.hashCode;
}

extension $CartItemInputDtoExtension on CartItemInputDto {
  CartItemInputDto copyWith({String? storeProductId, double? quantity}) {
    return CartItemInputDto(
      storeProductId: storeProductId ?? this.storeProductId,
      quantity: quantity ?? this.quantity,
    );
  }

  CartItemInputDto copyWithWrapped({
    Wrapped<String>? storeProductId,
    Wrapped<double>? quantity,
  }) {
    return CartItemInputDto(
      storeProductId: (storeProductId != null
          ? storeProductId.value
          : this.storeProductId),
      quantity: (quantity != null ? quantity.value : this.quantity),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class CartItemQuantityDto {
  const CartItemQuantityDto({required this.quantity});

  factory CartItemQuantityDto.fromJson(Map<String, dynamic> json) =>
      _$CartItemQuantityDtoFromJson(json);

  static const toJsonFactory = _$CartItemQuantityDtoToJson;
  Map<String, dynamic> toJson() => _$CartItemQuantityDtoToJson(this);

  @JsonKey(name: 'quantity')
  final double quantity;
  static const fromJsonFactory = _$CartItemQuantityDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is CartItemQuantityDto &&
            (identical(other.quantity, quantity) ||
                const DeepCollectionEquality().equals(
                  other.quantity,
                  quantity,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(quantity) ^ runtimeType.hashCode;
}

extension $CartItemQuantityDtoExtension on CartItemQuantityDto {
  CartItemQuantityDto copyWith({double? quantity}) {
    return CartItemQuantityDto(quantity: quantity ?? this.quantity);
  }

  CartItemQuantityDto copyWithWrapped({Wrapped<double>? quantity}) {
    return CartItemQuantityDto(
      quantity: (quantity != null ? quantity.value : this.quantity),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class DepositUploadUrlDto {
  const DepositUploadUrlDto({
    required this.contentType,
    required this.contentLength,
  });

  factory DepositUploadUrlDto.fromJson(Map<String, dynamic> json) =>
      _$DepositUploadUrlDtoFromJson(json);

  static const toJsonFactory = _$DepositUploadUrlDtoToJson;
  Map<String, dynamic> toJson() => _$DepositUploadUrlDtoToJson(this);

  @JsonKey(
    name: 'contentType',
    toJson: depositUploadUrlDtoContentTypeToJson,
    fromJson: depositUploadUrlDtoContentTypeFromJson,
  )
  final enums.DepositUploadUrlDtoContentType contentType;
  @JsonKey(name: 'contentLength')
  final double contentLength;
  static const fromJsonFactory = _$DepositUploadUrlDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is DepositUploadUrlDto &&
            (identical(other.contentType, contentType) ||
                const DeepCollectionEquality().equals(
                  other.contentType,
                  contentType,
                )) &&
            (identical(other.contentLength, contentLength) ||
                const DeepCollectionEquality().equals(
                  other.contentLength,
                  contentLength,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(contentType) ^
      const DeepCollectionEquality().hash(contentLength) ^
      runtimeType.hashCode;
}

extension $DepositUploadUrlDtoExtension on DepositUploadUrlDto {
  DepositUploadUrlDto copyWith({
    enums.DepositUploadUrlDtoContentType? contentType,
    double? contentLength,
  }) {
    return DepositUploadUrlDto(
      contentType: contentType ?? this.contentType,
      contentLength: contentLength ?? this.contentLength,
    );
  }

  DepositUploadUrlDto copyWithWrapped({
    Wrapped<enums.DepositUploadUrlDtoContentType>? contentType,
    Wrapped<double>? contentLength,
  }) {
    return DepositUploadUrlDto(
      contentType: (contentType != null ? contentType.value : this.contentType),
      contentLength: (contentLength != null
          ? contentLength.value
          : this.contentLength),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class CreateRiderDepositDto {
  const CreateRiderDepositDto({
    required this.amount,
    required this.bankRefNumber,
    required this.objectKey,
  });

  factory CreateRiderDepositDto.fromJson(Map<String, dynamic> json) =>
      _$CreateRiderDepositDtoFromJson(json);

  static const toJsonFactory = _$CreateRiderDepositDtoToJson;
  Map<String, dynamic> toJson() => _$CreateRiderDepositDtoToJson(this);

  @JsonKey(name: 'amount')
  final double amount;
  @JsonKey(name: 'bankRefNumber')
  final String bankRefNumber;
  @JsonKey(name: 'objectKey')
  final String objectKey;
  static const fromJsonFactory = _$CreateRiderDepositDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is CreateRiderDepositDto &&
            (identical(other.amount, amount) ||
                const DeepCollectionEquality().equals(other.amount, amount)) &&
            (identical(other.bankRefNumber, bankRefNumber) ||
                const DeepCollectionEquality().equals(
                  other.bankRefNumber,
                  bankRefNumber,
                )) &&
            (identical(other.objectKey, objectKey) ||
                const DeepCollectionEquality().equals(
                  other.objectKey,
                  objectKey,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(amount) ^
      const DeepCollectionEquality().hash(bankRefNumber) ^
      const DeepCollectionEquality().hash(objectKey) ^
      runtimeType.hashCode;
}

extension $CreateRiderDepositDtoExtension on CreateRiderDepositDto {
  CreateRiderDepositDto copyWith({
    double? amount,
    String? bankRefNumber,
    String? objectKey,
  }) {
    return CreateRiderDepositDto(
      amount: amount ?? this.amount,
      bankRefNumber: bankRefNumber ?? this.bankRefNumber,
      objectKey: objectKey ?? this.objectKey,
    );
  }

  CreateRiderDepositDto copyWithWrapped({
    Wrapped<double>? amount,
    Wrapped<String>? bankRefNumber,
    Wrapped<String>? objectKey,
  }) {
    return CreateRiderDepositDto(
      amount: (amount != null ? amount.value : this.amount),
      bankRefNumber: (bankRefNumber != null
          ? bankRefNumber.value
          : this.bankRefNumber),
      objectKey: (objectKey != null ? objectKey.value : this.objectKey),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class VerifyRiderDepositDto {
  const VerifyRiderDepositDto({
    required this.action,
    this.rejectionReason,
    this.receivedAmount,
    this.varianceReason,
  });

  factory VerifyRiderDepositDto.fromJson(Map<String, dynamic> json) =>
      _$VerifyRiderDepositDtoFromJson(json);

  static const toJsonFactory = _$VerifyRiderDepositDtoToJson;
  Map<String, dynamic> toJson() => _$VerifyRiderDepositDtoToJson(this);

  @JsonKey(
    name: 'action',
    toJson: verifyRiderDepositDtoActionToJson,
    fromJson: verifyRiderDepositDtoActionFromJson,
  )
  final enums.VerifyRiderDepositDtoAction action;
  @JsonKey(name: 'rejectionReason')
  final String? rejectionReason;
  @JsonKey(name: 'receivedAmount')
  final double? receivedAmount;
  @JsonKey(name: 'varianceReason')
  final String? varianceReason;
  static const fromJsonFactory = _$VerifyRiderDepositDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is VerifyRiderDepositDto &&
            (identical(other.action, action) ||
                const DeepCollectionEquality().equals(other.action, action)) &&
            (identical(other.rejectionReason, rejectionReason) ||
                const DeepCollectionEquality().equals(
                  other.rejectionReason,
                  rejectionReason,
                )) &&
            (identical(other.receivedAmount, receivedAmount) ||
                const DeepCollectionEquality().equals(
                  other.receivedAmount,
                  receivedAmount,
                )) &&
            (identical(other.varianceReason, varianceReason) ||
                const DeepCollectionEquality().equals(
                  other.varianceReason,
                  varianceReason,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(action) ^
      const DeepCollectionEquality().hash(rejectionReason) ^
      const DeepCollectionEquality().hash(receivedAmount) ^
      const DeepCollectionEquality().hash(varianceReason) ^
      runtimeType.hashCode;
}

extension $VerifyRiderDepositDtoExtension on VerifyRiderDepositDto {
  VerifyRiderDepositDto copyWith({
    enums.VerifyRiderDepositDtoAction? action,
    String? rejectionReason,
    double? receivedAmount,
    String? varianceReason,
  }) {
    return VerifyRiderDepositDto(
      action: action ?? this.action,
      rejectionReason: rejectionReason ?? this.rejectionReason,
      receivedAmount: receivedAmount ?? this.receivedAmount,
      varianceReason: varianceReason ?? this.varianceReason,
    );
  }

  VerifyRiderDepositDto copyWithWrapped({
    Wrapped<enums.VerifyRiderDepositDtoAction>? action,
    Wrapped<String?>? rejectionReason,
    Wrapped<double?>? receivedAmount,
    Wrapped<String?>? varianceReason,
  }) {
    return VerifyRiderDepositDto(
      action: (action != null ? action.value : this.action),
      rejectionReason: (rejectionReason != null
          ? rejectionReason.value
          : this.rejectionReason),
      receivedAmount: (receivedAmount != null
          ? receivedAmount.value
          : this.receivedAmount),
      varianceReason: (varianceReason != null
          ? varianceReason.value
          : this.varianceReason),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class ResolveDepositVarianceDto {
  const ResolveDepositVarianceDto({
    required this.action,
    required this.resolutionNote,
  });

  factory ResolveDepositVarianceDto.fromJson(Map<String, dynamic> json) =>
      _$ResolveDepositVarianceDtoFromJson(json);

  static const toJsonFactory = _$ResolveDepositVarianceDtoToJson;
  Map<String, dynamic> toJson() => _$ResolveDepositVarianceDtoToJson(this);

  @JsonKey(
    name: 'action',
    toJson: resolveDepositVarianceDtoActionToJson,
    fromJson: resolveDepositVarianceDtoActionFromJson,
  )
  final enums.ResolveDepositVarianceDtoAction action;
  @JsonKey(name: 'resolutionNote')
  final String resolutionNote;
  static const fromJsonFactory = _$ResolveDepositVarianceDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is ResolveDepositVarianceDto &&
            (identical(other.action, action) ||
                const DeepCollectionEquality().equals(other.action, action)) &&
            (identical(other.resolutionNote, resolutionNote) ||
                const DeepCollectionEquality().equals(
                  other.resolutionNote,
                  resolutionNote,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(action) ^
      const DeepCollectionEquality().hash(resolutionNote) ^
      runtimeType.hashCode;
}

extension $ResolveDepositVarianceDtoExtension on ResolveDepositVarianceDto {
  ResolveDepositVarianceDto copyWith({
    enums.ResolveDepositVarianceDtoAction? action,
    String? resolutionNote,
  }) {
    return ResolveDepositVarianceDto(
      action: action ?? this.action,
      resolutionNote: resolutionNote ?? this.resolutionNote,
    );
  }

  ResolveDepositVarianceDto copyWithWrapped({
    Wrapped<enums.ResolveDepositVarianceDtoAction>? action,
    Wrapped<String>? resolutionNote,
  }) {
    return ResolveDepositVarianceDto(
      action: (action != null ? action.value : this.action),
      resolutionNote: (resolutionNote != null
          ? resolutionNote.value
          : this.resolutionNote),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class CreateCampaignDto {
  const CreateCampaignDto({
    required this.name,
    this.storeId,
    this.code,
    required this.type,
    required this.value,
    this.minSubtotal,
    this.maxDiscount,
    required this.startsAt,
    required this.endsAt,
  });

  factory CreateCampaignDto.fromJson(Map<String, dynamic> json) =>
      _$CreateCampaignDtoFromJson(json);

  static const toJsonFactory = _$CreateCampaignDtoToJson;
  Map<String, dynamic> toJson() => _$CreateCampaignDtoToJson(this);

  @JsonKey(name: 'name')
  final String name;
  @JsonKey(name: 'storeId')
  final String? storeId;
  @JsonKey(name: 'code')
  final String? code;
  @JsonKey(
    name: 'type',
    toJson: createCampaignDtoTypeToJson,
    fromJson: createCampaignDtoTypeFromJson,
  )
  final enums.CreateCampaignDtoType type;
  @JsonKey(name: 'value')
  final double value;
  @JsonKey(name: 'minSubtotal')
  final double? minSubtotal;
  @JsonKey(name: 'maxDiscount')
  final double? maxDiscount;
  @JsonKey(name: 'startsAt')
  final DateTime startsAt;
  @JsonKey(name: 'endsAt')
  final DateTime endsAt;
  static const fromJsonFactory = _$CreateCampaignDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is CreateCampaignDto &&
            (identical(other.name, name) ||
                const DeepCollectionEquality().equals(other.name, name)) &&
            (identical(other.storeId, storeId) ||
                const DeepCollectionEquality().equals(
                  other.storeId,
                  storeId,
                )) &&
            (identical(other.code, code) ||
                const DeepCollectionEquality().equals(other.code, code)) &&
            (identical(other.type, type) ||
                const DeepCollectionEquality().equals(other.type, type)) &&
            (identical(other.value, value) ||
                const DeepCollectionEquality().equals(other.value, value)) &&
            (identical(other.minSubtotal, minSubtotal) ||
                const DeepCollectionEquality().equals(
                  other.minSubtotal,
                  minSubtotal,
                )) &&
            (identical(other.maxDiscount, maxDiscount) ||
                const DeepCollectionEquality().equals(
                  other.maxDiscount,
                  maxDiscount,
                )) &&
            (identical(other.startsAt, startsAt) ||
                const DeepCollectionEquality().equals(
                  other.startsAt,
                  startsAt,
                )) &&
            (identical(other.endsAt, endsAt) ||
                const DeepCollectionEquality().equals(other.endsAt, endsAt)));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(name) ^
      const DeepCollectionEquality().hash(storeId) ^
      const DeepCollectionEquality().hash(code) ^
      const DeepCollectionEquality().hash(type) ^
      const DeepCollectionEquality().hash(value) ^
      const DeepCollectionEquality().hash(minSubtotal) ^
      const DeepCollectionEquality().hash(maxDiscount) ^
      const DeepCollectionEquality().hash(startsAt) ^
      const DeepCollectionEquality().hash(endsAt) ^
      runtimeType.hashCode;
}

extension $CreateCampaignDtoExtension on CreateCampaignDto {
  CreateCampaignDto copyWith({
    String? name,
    String? storeId,
    String? code,
    enums.CreateCampaignDtoType? type,
    double? value,
    double? minSubtotal,
    double? maxDiscount,
    DateTime? startsAt,
    DateTime? endsAt,
  }) {
    return CreateCampaignDto(
      name: name ?? this.name,
      storeId: storeId ?? this.storeId,
      code: code ?? this.code,
      type: type ?? this.type,
      value: value ?? this.value,
      minSubtotal: minSubtotal ?? this.minSubtotal,
      maxDiscount: maxDiscount ?? this.maxDiscount,
      startsAt: startsAt ?? this.startsAt,
      endsAt: endsAt ?? this.endsAt,
    );
  }

  CreateCampaignDto copyWithWrapped({
    Wrapped<String>? name,
    Wrapped<String?>? storeId,
    Wrapped<String?>? code,
    Wrapped<enums.CreateCampaignDtoType>? type,
    Wrapped<double>? value,
    Wrapped<double?>? minSubtotal,
    Wrapped<double?>? maxDiscount,
    Wrapped<DateTime>? startsAt,
    Wrapped<DateTime>? endsAt,
  }) {
    return CreateCampaignDto(
      name: (name != null ? name.value : this.name),
      storeId: (storeId != null ? storeId.value : this.storeId),
      code: (code != null ? code.value : this.code),
      type: (type != null ? type.value : this.type),
      value: (value != null ? value.value : this.value),
      minSubtotal: (minSubtotal != null ? minSubtotal.value : this.minSubtotal),
      maxDiscount: (maxDiscount != null ? maxDiscount.value : this.maxDiscount),
      startsAt: (startsAt != null ? startsAt.value : this.startsAt),
      endsAt: (endsAt != null ? endsAt.value : this.endsAt),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class UpdateCampaignDto {
  const UpdateCampaignDto({
    this.name,
    this.value,
    this.minSubtotal,
    this.maxDiscount,
    this.startsAt,
    this.endsAt,
    this.isActive,
  });

  factory UpdateCampaignDto.fromJson(Map<String, dynamic> json) =>
      _$UpdateCampaignDtoFromJson(json);

  static const toJsonFactory = _$UpdateCampaignDtoToJson;
  Map<String, dynamic> toJson() => _$UpdateCampaignDtoToJson(this);

  @JsonKey(name: 'name')
  final String? name;
  @JsonKey(name: 'value')
  final double? value;
  @JsonKey(name: 'minSubtotal')
  final double? minSubtotal;
  @JsonKey(name: 'maxDiscount')
  final double? maxDiscount;
  @JsonKey(name: 'startsAt')
  final DateTime? startsAt;
  @JsonKey(name: 'endsAt')
  final DateTime? endsAt;
  @JsonKey(name: 'isActive')
  final bool? isActive;
  static const fromJsonFactory = _$UpdateCampaignDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is UpdateCampaignDto &&
            (identical(other.name, name) ||
                const DeepCollectionEquality().equals(other.name, name)) &&
            (identical(other.value, value) ||
                const DeepCollectionEquality().equals(other.value, value)) &&
            (identical(other.minSubtotal, minSubtotal) ||
                const DeepCollectionEquality().equals(
                  other.minSubtotal,
                  minSubtotal,
                )) &&
            (identical(other.maxDiscount, maxDiscount) ||
                const DeepCollectionEquality().equals(
                  other.maxDiscount,
                  maxDiscount,
                )) &&
            (identical(other.startsAt, startsAt) ||
                const DeepCollectionEquality().equals(
                  other.startsAt,
                  startsAt,
                )) &&
            (identical(other.endsAt, endsAt) ||
                const DeepCollectionEquality().equals(other.endsAt, endsAt)) &&
            (identical(other.isActive, isActive) ||
                const DeepCollectionEquality().equals(
                  other.isActive,
                  isActive,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(name) ^
      const DeepCollectionEquality().hash(value) ^
      const DeepCollectionEquality().hash(minSubtotal) ^
      const DeepCollectionEquality().hash(maxDiscount) ^
      const DeepCollectionEquality().hash(startsAt) ^
      const DeepCollectionEquality().hash(endsAt) ^
      const DeepCollectionEquality().hash(isActive) ^
      runtimeType.hashCode;
}

extension $UpdateCampaignDtoExtension on UpdateCampaignDto {
  UpdateCampaignDto copyWith({
    String? name,
    double? value,
    double? minSubtotal,
    double? maxDiscount,
    DateTime? startsAt,
    DateTime? endsAt,
    bool? isActive,
  }) {
    return UpdateCampaignDto(
      name: name ?? this.name,
      value: value ?? this.value,
      minSubtotal: minSubtotal ?? this.minSubtotal,
      maxDiscount: maxDiscount ?? this.maxDiscount,
      startsAt: startsAt ?? this.startsAt,
      endsAt: endsAt ?? this.endsAt,
      isActive: isActive ?? this.isActive,
    );
  }

  UpdateCampaignDto copyWithWrapped({
    Wrapped<String?>? name,
    Wrapped<double?>? value,
    Wrapped<double?>? minSubtotal,
    Wrapped<double?>? maxDiscount,
    Wrapped<DateTime?>? startsAt,
    Wrapped<DateTime?>? endsAt,
    Wrapped<bool?>? isActive,
  }) {
    return UpdateCampaignDto(
      name: (name != null ? name.value : this.name),
      value: (value != null ? value.value : this.value),
      minSubtotal: (minSubtotal != null ? minSubtotal.value : this.minSubtotal),
      maxDiscount: (maxDiscount != null ? maxDiscount.value : this.maxDiscount),
      startsAt: (startsAt != null ? startsAt.value : this.startsAt),
      endsAt: (endsAt != null ? endsAt.value : this.endsAt),
      isActive: (isActive != null ? isActive.value : this.isActive),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class KycUploadUrlDto {
  const KycUploadUrlDto({
    required this.contentType,
    required this.contentLength,
  });

  factory KycUploadUrlDto.fromJson(Map<String, dynamic> json) =>
      _$KycUploadUrlDtoFromJson(json);

  static const toJsonFactory = _$KycUploadUrlDtoToJson;
  Map<String, dynamic> toJson() => _$KycUploadUrlDtoToJson(this);

  @JsonKey(
    name: 'contentType',
    toJson: kycUploadUrlDtoContentTypeToJson,
    fromJson: kycUploadUrlDtoContentTypeFromJson,
  )
  final enums.KycUploadUrlDtoContentType contentType;
  @JsonKey(name: 'contentLength')
  final double contentLength;
  static const fromJsonFactory = _$KycUploadUrlDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is KycUploadUrlDto &&
            (identical(other.contentType, contentType) ||
                const DeepCollectionEquality().equals(
                  other.contentType,
                  contentType,
                )) &&
            (identical(other.contentLength, contentLength) ||
                const DeepCollectionEquality().equals(
                  other.contentLength,
                  contentLength,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(contentType) ^
      const DeepCollectionEquality().hash(contentLength) ^
      runtimeType.hashCode;
}

extension $KycUploadUrlDtoExtension on KycUploadUrlDto {
  KycUploadUrlDto copyWith({
    enums.KycUploadUrlDtoContentType? contentType,
    double? contentLength,
  }) {
    return KycUploadUrlDto(
      contentType: contentType ?? this.contentType,
      contentLength: contentLength ?? this.contentLength,
    );
  }

  KycUploadUrlDto copyWithWrapped({
    Wrapped<enums.KycUploadUrlDtoContentType>? contentType,
    Wrapped<double>? contentLength,
  }) {
    return KycUploadUrlDto(
      contentType: (contentType != null ? contentType.value : this.contentType),
      contentLength: (contentLength != null
          ? contentLength.value
          : this.contentLength),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class SubmitRiderKycDto {
  const SubmitRiderKycDto({
    required this.bikeNumber,
    required this.drivingLicenceObjectKey,
    required this.vehicleLicenceObjectKey,
  });

  factory SubmitRiderKycDto.fromJson(Map<String, dynamic> json) =>
      _$SubmitRiderKycDtoFromJson(json);

  static const toJsonFactory = _$SubmitRiderKycDtoToJson;
  Map<String, dynamic> toJson() => _$SubmitRiderKycDtoToJson(this);

  @JsonKey(name: 'bikeNumber')
  final String bikeNumber;
  @JsonKey(name: 'drivingLicenceObjectKey')
  final String drivingLicenceObjectKey;
  @JsonKey(name: 'vehicleLicenceObjectKey')
  final String vehicleLicenceObjectKey;
  static const fromJsonFactory = _$SubmitRiderKycDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is SubmitRiderKycDto &&
            (identical(other.bikeNumber, bikeNumber) ||
                const DeepCollectionEquality().equals(
                  other.bikeNumber,
                  bikeNumber,
                )) &&
            (identical(
                  other.drivingLicenceObjectKey,
                  drivingLicenceObjectKey,
                ) ||
                const DeepCollectionEquality().equals(
                  other.drivingLicenceObjectKey,
                  drivingLicenceObjectKey,
                )) &&
            (identical(
                  other.vehicleLicenceObjectKey,
                  vehicleLicenceObjectKey,
                ) ||
                const DeepCollectionEquality().equals(
                  other.vehicleLicenceObjectKey,
                  vehicleLicenceObjectKey,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(bikeNumber) ^
      const DeepCollectionEquality().hash(drivingLicenceObjectKey) ^
      const DeepCollectionEquality().hash(vehicleLicenceObjectKey) ^
      runtimeType.hashCode;
}

extension $SubmitRiderKycDtoExtension on SubmitRiderKycDto {
  SubmitRiderKycDto copyWith({
    String? bikeNumber,
    String? drivingLicenceObjectKey,
    String? vehicleLicenceObjectKey,
  }) {
    return SubmitRiderKycDto(
      bikeNumber: bikeNumber ?? this.bikeNumber,
      drivingLicenceObjectKey:
          drivingLicenceObjectKey ?? this.drivingLicenceObjectKey,
      vehicleLicenceObjectKey:
          vehicleLicenceObjectKey ?? this.vehicleLicenceObjectKey,
    );
  }

  SubmitRiderKycDto copyWithWrapped({
    Wrapped<String>? bikeNumber,
    Wrapped<String>? drivingLicenceObjectKey,
    Wrapped<String>? vehicleLicenceObjectKey,
  }) {
    return SubmitRiderKycDto(
      bikeNumber: (bikeNumber != null ? bikeNumber.value : this.bikeNumber),
      drivingLicenceObjectKey: (drivingLicenceObjectKey != null
          ? drivingLicenceObjectKey.value
          : this.drivingLicenceObjectKey),
      vehicleLicenceObjectKey: (vehicleLicenceObjectKey != null
          ? vehicleLicenceObjectKey.value
          : this.vehicleLicenceObjectKey),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class ApproveRiderKycDto {
  const ApproveRiderKycDto({required this.storeId, required this.riderType});

  factory ApproveRiderKycDto.fromJson(Map<String, dynamic> json) =>
      _$ApproveRiderKycDtoFromJson(json);

  static const toJsonFactory = _$ApproveRiderKycDtoToJson;
  Map<String, dynamic> toJson() => _$ApproveRiderKycDtoToJson(this);

  @JsonKey(name: 'storeId')
  final String storeId;
  @JsonKey(
    name: 'riderType',
    toJson: approveRiderKycDtoRiderTypeToJson,
    fromJson: approveRiderKycDtoRiderTypeFromJson,
  )
  final enums.ApproveRiderKycDtoRiderType riderType;
  static const fromJsonFactory = _$ApproveRiderKycDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is ApproveRiderKycDto &&
            (identical(other.storeId, storeId) ||
                const DeepCollectionEquality().equals(
                  other.storeId,
                  storeId,
                )) &&
            (identical(other.riderType, riderType) ||
                const DeepCollectionEquality().equals(
                  other.riderType,
                  riderType,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(storeId) ^
      const DeepCollectionEquality().hash(riderType) ^
      runtimeType.hashCode;
}

extension $ApproveRiderKycDtoExtension on ApproveRiderKycDto {
  ApproveRiderKycDto copyWith({
    String? storeId,
    enums.ApproveRiderKycDtoRiderType? riderType,
  }) {
    return ApproveRiderKycDto(
      storeId: storeId ?? this.storeId,
      riderType: riderType ?? this.riderType,
    );
  }

  ApproveRiderKycDto copyWithWrapped({
    Wrapped<String>? storeId,
    Wrapped<enums.ApproveRiderKycDtoRiderType>? riderType,
  }) {
    return ApproveRiderKycDto(
      storeId: (storeId != null ? storeId.value : this.storeId),
      riderType: (riderType != null ? riderType.value : this.riderType),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class RejectRiderKycDto {
  const RejectRiderKycDto({required this.reason});

  factory RejectRiderKycDto.fromJson(Map<String, dynamic> json) =>
      _$RejectRiderKycDtoFromJson(json);

  static const toJsonFactory = _$RejectRiderKycDtoToJson;
  Map<String, dynamic> toJson() => _$RejectRiderKycDtoToJson(this);

  @JsonKey(name: 'reason')
  final String reason;
  static const fromJsonFactory = _$RejectRiderKycDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is RejectRiderKycDto &&
            (identical(other.reason, reason) ||
                const DeepCollectionEquality().equals(other.reason, reason)));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(reason) ^ runtimeType.hashCode;
}

extension $RejectRiderKycDtoExtension on RejectRiderKycDto {
  RejectRiderKycDto copyWith({String? reason}) {
    return RejectRiderKycDto(reason: reason ?? this.reason);
  }

  RejectRiderKycDto copyWithWrapped({Wrapped<String>? reason}) {
    return RejectRiderKycDto(
      reason: (reason != null ? reason.value : this.reason),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class SuspendRiderDto {
  const SuspendRiderDto({required this.reason});

  factory SuspendRiderDto.fromJson(Map<String, dynamic> json) =>
      _$SuspendRiderDtoFromJson(json);

  static const toJsonFactory = _$SuspendRiderDtoToJson;
  Map<String, dynamic> toJson() => _$SuspendRiderDtoToJson(this);

  @JsonKey(name: 'reason')
  final String reason;
  static const fromJsonFactory = _$SuspendRiderDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is SuspendRiderDto &&
            (identical(other.reason, reason) ||
                const DeepCollectionEquality().equals(other.reason, reason)));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(reason) ^ runtimeType.hashCode;
}

extension $SuspendRiderDtoExtension on SuspendRiderDto {
  SuspendRiderDto copyWith({String? reason}) {
    return SuspendRiderDto(reason: reason ?? this.reason);
  }

  SuspendRiderDto copyWithWrapped({Wrapped<String>? reason}) {
    return SuspendRiderDto(
      reason: (reason != null ? reason.value : this.reason),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class CreateAddressDto {
  const CreateAddressDto({
    required this.label,
    required this.recipientName,
    required this.recipientPhone,
    required this.streetAddress,
    this.landmark,
    required this.locality,
    required this.latitude,
    required this.longitude,
    this.isDefault,
  });

  factory CreateAddressDto.fromJson(Map<String, dynamic> json) =>
      _$CreateAddressDtoFromJson(json);

  static const toJsonFactory = _$CreateAddressDtoToJson;
  Map<String, dynamic> toJson() => _$CreateAddressDtoToJson(this);

  @JsonKey(name: 'label')
  final String label;
  @JsonKey(name: 'recipientName')
  final String recipientName;
  @JsonKey(name: 'recipientPhone')
  final String recipientPhone;
  @JsonKey(name: 'streetAddress')
  final String streetAddress;
  @JsonKey(name: 'landmark')
  final String? landmark;
  @JsonKey(name: 'locality')
  final String locality;
  @JsonKey(name: 'latitude')
  final double latitude;
  @JsonKey(name: 'longitude')
  final double longitude;
  @JsonKey(name: 'isDefault')
  final bool? isDefault;
  static const fromJsonFactory = _$CreateAddressDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is CreateAddressDto &&
            (identical(other.label, label) ||
                const DeepCollectionEquality().equals(other.label, label)) &&
            (identical(other.recipientName, recipientName) ||
                const DeepCollectionEquality().equals(
                  other.recipientName,
                  recipientName,
                )) &&
            (identical(other.recipientPhone, recipientPhone) ||
                const DeepCollectionEquality().equals(
                  other.recipientPhone,
                  recipientPhone,
                )) &&
            (identical(other.streetAddress, streetAddress) ||
                const DeepCollectionEquality().equals(
                  other.streetAddress,
                  streetAddress,
                )) &&
            (identical(other.landmark, landmark) ||
                const DeepCollectionEquality().equals(
                  other.landmark,
                  landmark,
                )) &&
            (identical(other.locality, locality) ||
                const DeepCollectionEquality().equals(
                  other.locality,
                  locality,
                )) &&
            (identical(other.latitude, latitude) ||
                const DeepCollectionEquality().equals(
                  other.latitude,
                  latitude,
                )) &&
            (identical(other.longitude, longitude) ||
                const DeepCollectionEquality().equals(
                  other.longitude,
                  longitude,
                )) &&
            (identical(other.isDefault, isDefault) ||
                const DeepCollectionEquality().equals(
                  other.isDefault,
                  isDefault,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(label) ^
      const DeepCollectionEquality().hash(recipientName) ^
      const DeepCollectionEquality().hash(recipientPhone) ^
      const DeepCollectionEquality().hash(streetAddress) ^
      const DeepCollectionEquality().hash(landmark) ^
      const DeepCollectionEquality().hash(locality) ^
      const DeepCollectionEquality().hash(latitude) ^
      const DeepCollectionEquality().hash(longitude) ^
      const DeepCollectionEquality().hash(isDefault) ^
      runtimeType.hashCode;
}

extension $CreateAddressDtoExtension on CreateAddressDto {
  CreateAddressDto copyWith({
    String? label,
    String? recipientName,
    String? recipientPhone,
    String? streetAddress,
    String? landmark,
    String? locality,
    double? latitude,
    double? longitude,
    bool? isDefault,
  }) {
    return CreateAddressDto(
      label: label ?? this.label,
      recipientName: recipientName ?? this.recipientName,
      recipientPhone: recipientPhone ?? this.recipientPhone,
      streetAddress: streetAddress ?? this.streetAddress,
      landmark: landmark ?? this.landmark,
      locality: locality ?? this.locality,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      isDefault: isDefault ?? this.isDefault,
    );
  }

  CreateAddressDto copyWithWrapped({
    Wrapped<String>? label,
    Wrapped<String>? recipientName,
    Wrapped<String>? recipientPhone,
    Wrapped<String>? streetAddress,
    Wrapped<String?>? landmark,
    Wrapped<String>? locality,
    Wrapped<double>? latitude,
    Wrapped<double>? longitude,
    Wrapped<bool?>? isDefault,
  }) {
    return CreateAddressDto(
      label: (label != null ? label.value : this.label),
      recipientName: (recipientName != null
          ? recipientName.value
          : this.recipientName),
      recipientPhone: (recipientPhone != null
          ? recipientPhone.value
          : this.recipientPhone),
      streetAddress: (streetAddress != null
          ? streetAddress.value
          : this.streetAddress),
      landmark: (landmark != null ? landmark.value : this.landmark),
      locality: (locality != null ? locality.value : this.locality),
      latitude: (latitude != null ? latitude.value : this.latitude),
      longitude: (longitude != null ? longitude.value : this.longitude),
      isDefault: (isDefault != null ? isDefault.value : this.isDefault),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class UpdateAddressDto {
  const UpdateAddressDto({
    this.label,
    this.recipientName,
    this.recipientPhone,
    this.streetAddress,
    this.landmark,
    this.locality,
    this.latitude,
    this.longitude,
    this.isDefault,
  });

  factory UpdateAddressDto.fromJson(Map<String, dynamic> json) =>
      _$UpdateAddressDtoFromJson(json);

  static const toJsonFactory = _$UpdateAddressDtoToJson;
  Map<String, dynamic> toJson() => _$UpdateAddressDtoToJson(this);

  @JsonKey(name: 'label')
  final String? label;
  @JsonKey(name: 'recipientName')
  final String? recipientName;
  @JsonKey(name: 'recipientPhone')
  final String? recipientPhone;
  @JsonKey(name: 'streetAddress')
  final String? streetAddress;
  @JsonKey(name: 'landmark')
  final String? landmark;
  @JsonKey(name: 'locality')
  final String? locality;
  @JsonKey(name: 'latitude')
  final double? latitude;
  @JsonKey(name: 'longitude')
  final double? longitude;
  @JsonKey(name: 'isDefault')
  final bool? isDefault;
  static const fromJsonFactory = _$UpdateAddressDtoFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is UpdateAddressDto &&
            (identical(other.label, label) ||
                const DeepCollectionEquality().equals(other.label, label)) &&
            (identical(other.recipientName, recipientName) ||
                const DeepCollectionEquality().equals(
                  other.recipientName,
                  recipientName,
                )) &&
            (identical(other.recipientPhone, recipientPhone) ||
                const DeepCollectionEquality().equals(
                  other.recipientPhone,
                  recipientPhone,
                )) &&
            (identical(other.streetAddress, streetAddress) ||
                const DeepCollectionEquality().equals(
                  other.streetAddress,
                  streetAddress,
                )) &&
            (identical(other.landmark, landmark) ||
                const DeepCollectionEquality().equals(
                  other.landmark,
                  landmark,
                )) &&
            (identical(other.locality, locality) ||
                const DeepCollectionEquality().equals(
                  other.locality,
                  locality,
                )) &&
            (identical(other.latitude, latitude) ||
                const DeepCollectionEquality().equals(
                  other.latitude,
                  latitude,
                )) &&
            (identical(other.longitude, longitude) ||
                const DeepCollectionEquality().equals(
                  other.longitude,
                  longitude,
                )) &&
            (identical(other.isDefault, isDefault) ||
                const DeepCollectionEquality().equals(
                  other.isDefault,
                  isDefault,
                )));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(label) ^
      const DeepCollectionEquality().hash(recipientName) ^
      const DeepCollectionEquality().hash(recipientPhone) ^
      const DeepCollectionEquality().hash(streetAddress) ^
      const DeepCollectionEquality().hash(landmark) ^
      const DeepCollectionEquality().hash(locality) ^
      const DeepCollectionEquality().hash(latitude) ^
      const DeepCollectionEquality().hash(longitude) ^
      const DeepCollectionEquality().hash(isDefault) ^
      runtimeType.hashCode;
}

extension $UpdateAddressDtoExtension on UpdateAddressDto {
  UpdateAddressDto copyWith({
    String? label,
    String? recipientName,
    String? recipientPhone,
    String? streetAddress,
    String? landmark,
    String? locality,
    double? latitude,
    double? longitude,
    bool? isDefault,
  }) {
    return UpdateAddressDto(
      label: label ?? this.label,
      recipientName: recipientName ?? this.recipientName,
      recipientPhone: recipientPhone ?? this.recipientPhone,
      streetAddress: streetAddress ?? this.streetAddress,
      landmark: landmark ?? this.landmark,
      locality: locality ?? this.locality,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      isDefault: isDefault ?? this.isDefault,
    );
  }

  UpdateAddressDto copyWithWrapped({
    Wrapped<String?>? label,
    Wrapped<String?>? recipientName,
    Wrapped<String?>? recipientPhone,
    Wrapped<String?>? streetAddress,
    Wrapped<String?>? landmark,
    Wrapped<String?>? locality,
    Wrapped<double?>? latitude,
    Wrapped<double?>? longitude,
    Wrapped<bool?>? isDefault,
  }) {
    return UpdateAddressDto(
      label: (label != null ? label.value : this.label),
      recipientName: (recipientName != null
          ? recipientName.value
          : this.recipientName),
      recipientPhone: (recipientPhone != null
          ? recipientPhone.value
          : this.recipientPhone),
      streetAddress: (streetAddress != null
          ? streetAddress.value
          : this.streetAddress),
      landmark: (landmark != null ? landmark.value : this.landmark),
      locality: (locality != null ? locality.value : this.locality),
      latitude: (latitude != null ? latitude.value : this.latitude),
      longitude: (longitude != null ? longitude.value : this.longitude),
      isDefault: (isDefault != null ? isDefault.value : this.isDefault),
    );
  }
}

@JsonSerializable(explicitToJson: true)
class ApiV1ProductsIdImagePost$RequestBody {
  const ApiV1ProductsIdImagePost$RequestBody({required this.image});

  factory ApiV1ProductsIdImagePost$RequestBody.fromJson(
    Map<String, dynamic> json,
  ) => _$ApiV1ProductsIdImagePost$RequestBodyFromJson(json);

  static const toJsonFactory = _$ApiV1ProductsIdImagePost$RequestBodyToJson;
  Map<String, dynamic> toJson() =>
      _$ApiV1ProductsIdImagePost$RequestBodyToJson(this);

  @JsonKey(name: 'image')
  final String image;
  static const fromJsonFactory = _$ApiV1ProductsIdImagePost$RequestBodyFromJson;

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is ApiV1ProductsIdImagePost$RequestBody &&
            (identical(other.image, image) ||
                const DeepCollectionEquality().equals(other.image, image)));
  }

  @override
  String toString() => jsonEncode(this);

  @override
  int get hashCode =>
      const DeepCollectionEquality().hash(image) ^ runtimeType.hashCode;
}

extension $ApiV1ProductsIdImagePost$RequestBodyExtension
    on ApiV1ProductsIdImagePost$RequestBody {
  ApiV1ProductsIdImagePost$RequestBody copyWith({String? image}) {
    return ApiV1ProductsIdImagePost$RequestBody(image: image ?? this.image);
  }

  ApiV1ProductsIdImagePost$RequestBody copyWithWrapped({
    Wrapped<String>? image,
  }) {
    return ApiV1ProductsIdImagePost$RequestBody(
      image: (image != null ? image.value : this.image),
    );
  }
}

String? resolveTransferLineDtoResolutionNullableToJson(
  enums.ResolveTransferLineDtoResolution? resolveTransferLineDtoResolution,
) {
  return resolveTransferLineDtoResolution?.value;
}

String? resolveTransferLineDtoResolutionToJson(
  enums.ResolveTransferLineDtoResolution resolveTransferLineDtoResolution,
) {
  return resolveTransferLineDtoResolution.value;
}

enums.ResolveTransferLineDtoResolution resolveTransferLineDtoResolutionFromJson(
  Object? resolveTransferLineDtoResolution, [
  enums.ResolveTransferLineDtoResolution? defaultValue,
]) {
  return enums.ResolveTransferLineDtoResolution.values.firstWhereOrNull(
        (e) => e.value == resolveTransferLineDtoResolution,
      ) ??
      defaultValue ??
      enums.ResolveTransferLineDtoResolution.swaggerGeneratedUnknown;
}

enums.ResolveTransferLineDtoResolution?
resolveTransferLineDtoResolutionNullableFromJson(
  Object? resolveTransferLineDtoResolution, [
  enums.ResolveTransferLineDtoResolution? defaultValue,
]) {
  if (resolveTransferLineDtoResolution == null) {
    return null;
  }
  return enums.ResolveTransferLineDtoResolution.values.firstWhereOrNull(
        (e) => e.value == resolveTransferLineDtoResolution,
      ) ??
      defaultValue;
}

String resolveTransferLineDtoResolutionExplodedListToJson(
  List<enums.ResolveTransferLineDtoResolution>?
  resolveTransferLineDtoResolution,
) {
  return resolveTransferLineDtoResolution?.map((e) => e.value!).join(',') ?? '';
}

List<String> resolveTransferLineDtoResolutionListToJson(
  List<enums.ResolveTransferLineDtoResolution>?
  resolveTransferLineDtoResolution,
) {
  if (resolveTransferLineDtoResolution == null) {
    return [];
  }

  return resolveTransferLineDtoResolution.map((e) => e.value!).toList();
}

List<enums.ResolveTransferLineDtoResolution>
resolveTransferLineDtoResolutionListFromJson(
  List? resolveTransferLineDtoResolution, [
  List<enums.ResolveTransferLineDtoResolution>? defaultValue,
]) {
  if (resolveTransferLineDtoResolution == null) {
    return defaultValue ?? [];
  }

  return resolveTransferLineDtoResolution
      .map((e) => resolveTransferLineDtoResolutionFromJson(e.toString()))
      .toList();
}

List<enums.ResolveTransferLineDtoResolution>?
resolveTransferLineDtoResolutionNullableListFromJson(
  List? resolveTransferLineDtoResolution, [
  List<enums.ResolveTransferLineDtoResolution>? defaultValue,
]) {
  if (resolveTransferLineDtoResolution == null) {
    return defaultValue;
  }

  return resolveTransferLineDtoResolution
      .map((e) => resolveTransferLineDtoResolutionFromJson(e.toString()))
      .toList();
}

String? depositUploadUrlDtoContentTypeNullableToJson(
  enums.DepositUploadUrlDtoContentType? depositUploadUrlDtoContentType,
) {
  return depositUploadUrlDtoContentType?.value;
}

String? depositUploadUrlDtoContentTypeToJson(
  enums.DepositUploadUrlDtoContentType depositUploadUrlDtoContentType,
) {
  return depositUploadUrlDtoContentType.value;
}

enums.DepositUploadUrlDtoContentType depositUploadUrlDtoContentTypeFromJson(
  Object? depositUploadUrlDtoContentType, [
  enums.DepositUploadUrlDtoContentType? defaultValue,
]) {
  return enums.DepositUploadUrlDtoContentType.values.firstWhereOrNull(
        (e) => e.value == depositUploadUrlDtoContentType,
      ) ??
      defaultValue ??
      enums.DepositUploadUrlDtoContentType.swaggerGeneratedUnknown;
}

enums.DepositUploadUrlDtoContentType?
depositUploadUrlDtoContentTypeNullableFromJson(
  Object? depositUploadUrlDtoContentType, [
  enums.DepositUploadUrlDtoContentType? defaultValue,
]) {
  if (depositUploadUrlDtoContentType == null) {
    return null;
  }
  return enums.DepositUploadUrlDtoContentType.values.firstWhereOrNull(
        (e) => e.value == depositUploadUrlDtoContentType,
      ) ??
      defaultValue;
}

String depositUploadUrlDtoContentTypeExplodedListToJson(
  List<enums.DepositUploadUrlDtoContentType>? depositUploadUrlDtoContentType,
) {
  return depositUploadUrlDtoContentType?.map((e) => e.value!).join(',') ?? '';
}

List<String> depositUploadUrlDtoContentTypeListToJson(
  List<enums.DepositUploadUrlDtoContentType>? depositUploadUrlDtoContentType,
) {
  if (depositUploadUrlDtoContentType == null) {
    return [];
  }

  return depositUploadUrlDtoContentType.map((e) => e.value!).toList();
}

List<enums.DepositUploadUrlDtoContentType>
depositUploadUrlDtoContentTypeListFromJson(
  List? depositUploadUrlDtoContentType, [
  List<enums.DepositUploadUrlDtoContentType>? defaultValue,
]) {
  if (depositUploadUrlDtoContentType == null) {
    return defaultValue ?? [];
  }

  return depositUploadUrlDtoContentType
      .map((e) => depositUploadUrlDtoContentTypeFromJson(e.toString()))
      .toList();
}

List<enums.DepositUploadUrlDtoContentType>?
depositUploadUrlDtoContentTypeNullableListFromJson(
  List? depositUploadUrlDtoContentType, [
  List<enums.DepositUploadUrlDtoContentType>? defaultValue,
]) {
  if (depositUploadUrlDtoContentType == null) {
    return defaultValue;
  }

  return depositUploadUrlDtoContentType
      .map((e) => depositUploadUrlDtoContentTypeFromJson(e.toString()))
      .toList();
}

String? verifyRiderDepositDtoActionNullableToJson(
  enums.VerifyRiderDepositDtoAction? verifyRiderDepositDtoAction,
) {
  return verifyRiderDepositDtoAction?.value;
}

String? verifyRiderDepositDtoActionToJson(
  enums.VerifyRiderDepositDtoAction verifyRiderDepositDtoAction,
) {
  return verifyRiderDepositDtoAction.value;
}

enums.VerifyRiderDepositDtoAction verifyRiderDepositDtoActionFromJson(
  Object? verifyRiderDepositDtoAction, [
  enums.VerifyRiderDepositDtoAction? defaultValue,
]) {
  return enums.VerifyRiderDepositDtoAction.values.firstWhereOrNull(
        (e) => e.value == verifyRiderDepositDtoAction,
      ) ??
      defaultValue ??
      enums.VerifyRiderDepositDtoAction.swaggerGeneratedUnknown;
}

enums.VerifyRiderDepositDtoAction? verifyRiderDepositDtoActionNullableFromJson(
  Object? verifyRiderDepositDtoAction, [
  enums.VerifyRiderDepositDtoAction? defaultValue,
]) {
  if (verifyRiderDepositDtoAction == null) {
    return null;
  }
  return enums.VerifyRiderDepositDtoAction.values.firstWhereOrNull(
        (e) => e.value == verifyRiderDepositDtoAction,
      ) ??
      defaultValue;
}

String verifyRiderDepositDtoActionExplodedListToJson(
  List<enums.VerifyRiderDepositDtoAction>? verifyRiderDepositDtoAction,
) {
  return verifyRiderDepositDtoAction?.map((e) => e.value!).join(',') ?? '';
}

List<String> verifyRiderDepositDtoActionListToJson(
  List<enums.VerifyRiderDepositDtoAction>? verifyRiderDepositDtoAction,
) {
  if (verifyRiderDepositDtoAction == null) {
    return [];
  }

  return verifyRiderDepositDtoAction.map((e) => e.value!).toList();
}

List<enums.VerifyRiderDepositDtoAction> verifyRiderDepositDtoActionListFromJson(
  List? verifyRiderDepositDtoAction, [
  List<enums.VerifyRiderDepositDtoAction>? defaultValue,
]) {
  if (verifyRiderDepositDtoAction == null) {
    return defaultValue ?? [];
  }

  return verifyRiderDepositDtoAction
      .map((e) => verifyRiderDepositDtoActionFromJson(e.toString()))
      .toList();
}

List<enums.VerifyRiderDepositDtoAction>?
verifyRiderDepositDtoActionNullableListFromJson(
  List? verifyRiderDepositDtoAction, [
  List<enums.VerifyRiderDepositDtoAction>? defaultValue,
]) {
  if (verifyRiderDepositDtoAction == null) {
    return defaultValue;
  }

  return verifyRiderDepositDtoAction
      .map((e) => verifyRiderDepositDtoActionFromJson(e.toString()))
      .toList();
}

String? resolveDepositVarianceDtoActionNullableToJson(
  enums.ResolveDepositVarianceDtoAction? resolveDepositVarianceDtoAction,
) {
  return resolveDepositVarianceDtoAction?.value;
}

String? resolveDepositVarianceDtoActionToJson(
  enums.ResolveDepositVarianceDtoAction resolveDepositVarianceDtoAction,
) {
  return resolveDepositVarianceDtoAction.value;
}

enums.ResolveDepositVarianceDtoAction resolveDepositVarianceDtoActionFromJson(
  Object? resolveDepositVarianceDtoAction, [
  enums.ResolveDepositVarianceDtoAction? defaultValue,
]) {
  return enums.ResolveDepositVarianceDtoAction.values.firstWhereOrNull(
        (e) => e.value == resolveDepositVarianceDtoAction,
      ) ??
      defaultValue ??
      enums.ResolveDepositVarianceDtoAction.swaggerGeneratedUnknown;
}

enums.ResolveDepositVarianceDtoAction?
resolveDepositVarianceDtoActionNullableFromJson(
  Object? resolveDepositVarianceDtoAction, [
  enums.ResolveDepositVarianceDtoAction? defaultValue,
]) {
  if (resolveDepositVarianceDtoAction == null) {
    return null;
  }
  return enums.ResolveDepositVarianceDtoAction.values.firstWhereOrNull(
        (e) => e.value == resolveDepositVarianceDtoAction,
      ) ??
      defaultValue;
}

String resolveDepositVarianceDtoActionExplodedListToJson(
  List<enums.ResolveDepositVarianceDtoAction>? resolveDepositVarianceDtoAction,
) {
  return resolveDepositVarianceDtoAction?.map((e) => e.value!).join(',') ?? '';
}

List<String> resolveDepositVarianceDtoActionListToJson(
  List<enums.ResolveDepositVarianceDtoAction>? resolveDepositVarianceDtoAction,
) {
  if (resolveDepositVarianceDtoAction == null) {
    return [];
  }

  return resolveDepositVarianceDtoAction.map((e) => e.value!).toList();
}

List<enums.ResolveDepositVarianceDtoAction>
resolveDepositVarianceDtoActionListFromJson(
  List? resolveDepositVarianceDtoAction, [
  List<enums.ResolveDepositVarianceDtoAction>? defaultValue,
]) {
  if (resolveDepositVarianceDtoAction == null) {
    return defaultValue ?? [];
  }

  return resolveDepositVarianceDtoAction
      .map((e) => resolveDepositVarianceDtoActionFromJson(e.toString()))
      .toList();
}

List<enums.ResolveDepositVarianceDtoAction>?
resolveDepositVarianceDtoActionNullableListFromJson(
  List? resolveDepositVarianceDtoAction, [
  List<enums.ResolveDepositVarianceDtoAction>? defaultValue,
]) {
  if (resolveDepositVarianceDtoAction == null) {
    return defaultValue;
  }

  return resolveDepositVarianceDtoAction
      .map((e) => resolveDepositVarianceDtoActionFromJson(e.toString()))
      .toList();
}

String? createCampaignDtoTypeNullableToJson(
  enums.CreateCampaignDtoType? createCampaignDtoType,
) {
  return createCampaignDtoType?.value;
}

String? createCampaignDtoTypeToJson(
  enums.CreateCampaignDtoType createCampaignDtoType,
) {
  return createCampaignDtoType.value;
}

enums.CreateCampaignDtoType createCampaignDtoTypeFromJson(
  Object? createCampaignDtoType, [
  enums.CreateCampaignDtoType? defaultValue,
]) {
  return enums.CreateCampaignDtoType.values.firstWhereOrNull(
        (e) => e.value == createCampaignDtoType,
      ) ??
      defaultValue ??
      enums.CreateCampaignDtoType.swaggerGeneratedUnknown;
}

enums.CreateCampaignDtoType? createCampaignDtoTypeNullableFromJson(
  Object? createCampaignDtoType, [
  enums.CreateCampaignDtoType? defaultValue,
]) {
  if (createCampaignDtoType == null) {
    return null;
  }
  return enums.CreateCampaignDtoType.values.firstWhereOrNull(
        (e) => e.value == createCampaignDtoType,
      ) ??
      defaultValue;
}

String createCampaignDtoTypeExplodedListToJson(
  List<enums.CreateCampaignDtoType>? createCampaignDtoType,
) {
  return createCampaignDtoType?.map((e) => e.value!).join(',') ?? '';
}

List<String> createCampaignDtoTypeListToJson(
  List<enums.CreateCampaignDtoType>? createCampaignDtoType,
) {
  if (createCampaignDtoType == null) {
    return [];
  }

  return createCampaignDtoType.map((e) => e.value!).toList();
}

List<enums.CreateCampaignDtoType> createCampaignDtoTypeListFromJson(
  List? createCampaignDtoType, [
  List<enums.CreateCampaignDtoType>? defaultValue,
]) {
  if (createCampaignDtoType == null) {
    return defaultValue ?? [];
  }

  return createCampaignDtoType
      .map((e) => createCampaignDtoTypeFromJson(e.toString()))
      .toList();
}

List<enums.CreateCampaignDtoType>? createCampaignDtoTypeNullableListFromJson(
  List? createCampaignDtoType, [
  List<enums.CreateCampaignDtoType>? defaultValue,
]) {
  if (createCampaignDtoType == null) {
    return defaultValue;
  }

  return createCampaignDtoType
      .map((e) => createCampaignDtoTypeFromJson(e.toString()))
      .toList();
}

String? kycUploadUrlDtoContentTypeNullableToJson(
  enums.KycUploadUrlDtoContentType? kycUploadUrlDtoContentType,
) {
  return kycUploadUrlDtoContentType?.value;
}

String? kycUploadUrlDtoContentTypeToJson(
  enums.KycUploadUrlDtoContentType kycUploadUrlDtoContentType,
) {
  return kycUploadUrlDtoContentType.value;
}

enums.KycUploadUrlDtoContentType kycUploadUrlDtoContentTypeFromJson(
  Object? kycUploadUrlDtoContentType, [
  enums.KycUploadUrlDtoContentType? defaultValue,
]) {
  return enums.KycUploadUrlDtoContentType.values.firstWhereOrNull(
        (e) => e.value == kycUploadUrlDtoContentType,
      ) ??
      defaultValue ??
      enums.KycUploadUrlDtoContentType.swaggerGeneratedUnknown;
}

enums.KycUploadUrlDtoContentType? kycUploadUrlDtoContentTypeNullableFromJson(
  Object? kycUploadUrlDtoContentType, [
  enums.KycUploadUrlDtoContentType? defaultValue,
]) {
  if (kycUploadUrlDtoContentType == null) {
    return null;
  }
  return enums.KycUploadUrlDtoContentType.values.firstWhereOrNull(
        (e) => e.value == kycUploadUrlDtoContentType,
      ) ??
      defaultValue;
}

String kycUploadUrlDtoContentTypeExplodedListToJson(
  List<enums.KycUploadUrlDtoContentType>? kycUploadUrlDtoContentType,
) {
  return kycUploadUrlDtoContentType?.map((e) => e.value!).join(',') ?? '';
}

List<String> kycUploadUrlDtoContentTypeListToJson(
  List<enums.KycUploadUrlDtoContentType>? kycUploadUrlDtoContentType,
) {
  if (kycUploadUrlDtoContentType == null) {
    return [];
  }

  return kycUploadUrlDtoContentType.map((e) => e.value!).toList();
}

List<enums.KycUploadUrlDtoContentType> kycUploadUrlDtoContentTypeListFromJson(
  List? kycUploadUrlDtoContentType, [
  List<enums.KycUploadUrlDtoContentType>? defaultValue,
]) {
  if (kycUploadUrlDtoContentType == null) {
    return defaultValue ?? [];
  }

  return kycUploadUrlDtoContentType
      .map((e) => kycUploadUrlDtoContentTypeFromJson(e.toString()))
      .toList();
}

List<enums.KycUploadUrlDtoContentType>?
kycUploadUrlDtoContentTypeNullableListFromJson(
  List? kycUploadUrlDtoContentType, [
  List<enums.KycUploadUrlDtoContentType>? defaultValue,
]) {
  if (kycUploadUrlDtoContentType == null) {
    return defaultValue;
  }

  return kycUploadUrlDtoContentType
      .map((e) => kycUploadUrlDtoContentTypeFromJson(e.toString()))
      .toList();
}

String? approveRiderKycDtoRiderTypeNullableToJson(
  enums.ApproveRiderKycDtoRiderType? approveRiderKycDtoRiderType,
) {
  return approveRiderKycDtoRiderType?.value;
}

String? approveRiderKycDtoRiderTypeToJson(
  enums.ApproveRiderKycDtoRiderType approveRiderKycDtoRiderType,
) {
  return approveRiderKycDtoRiderType.value;
}

enums.ApproveRiderKycDtoRiderType approveRiderKycDtoRiderTypeFromJson(
  Object? approveRiderKycDtoRiderType, [
  enums.ApproveRiderKycDtoRiderType? defaultValue,
]) {
  return enums.ApproveRiderKycDtoRiderType.values.firstWhereOrNull(
        (e) => e.value == approveRiderKycDtoRiderType,
      ) ??
      defaultValue ??
      enums.ApproveRiderKycDtoRiderType.swaggerGeneratedUnknown;
}

enums.ApproveRiderKycDtoRiderType? approveRiderKycDtoRiderTypeNullableFromJson(
  Object? approveRiderKycDtoRiderType, [
  enums.ApproveRiderKycDtoRiderType? defaultValue,
]) {
  if (approveRiderKycDtoRiderType == null) {
    return null;
  }
  return enums.ApproveRiderKycDtoRiderType.values.firstWhereOrNull(
        (e) => e.value == approveRiderKycDtoRiderType,
      ) ??
      defaultValue;
}

String approveRiderKycDtoRiderTypeExplodedListToJson(
  List<enums.ApproveRiderKycDtoRiderType>? approveRiderKycDtoRiderType,
) {
  return approveRiderKycDtoRiderType?.map((e) => e.value!).join(',') ?? '';
}

List<String> approveRiderKycDtoRiderTypeListToJson(
  List<enums.ApproveRiderKycDtoRiderType>? approveRiderKycDtoRiderType,
) {
  if (approveRiderKycDtoRiderType == null) {
    return [];
  }

  return approveRiderKycDtoRiderType.map((e) => e.value!).toList();
}

List<enums.ApproveRiderKycDtoRiderType> approveRiderKycDtoRiderTypeListFromJson(
  List? approveRiderKycDtoRiderType, [
  List<enums.ApproveRiderKycDtoRiderType>? defaultValue,
]) {
  if (approveRiderKycDtoRiderType == null) {
    return defaultValue ?? [];
  }

  return approveRiderKycDtoRiderType
      .map((e) => approveRiderKycDtoRiderTypeFromJson(e.toString()))
      .toList();
}

List<enums.ApproveRiderKycDtoRiderType>?
approveRiderKycDtoRiderTypeNullableListFromJson(
  List? approveRiderKycDtoRiderType, [
  List<enums.ApproveRiderKycDtoRiderType>? defaultValue,
]) {
  if (approveRiderKycDtoRiderType == null) {
    return defaultValue;
  }

  return approveRiderKycDtoRiderType
      .map((e) => approveRiderKycDtoRiderTypeFromJson(e.toString()))
      .toList();
}

String? apiV1TransfersGetStatusNullableToJson(
  enums.ApiV1TransfersGetStatus? apiV1TransfersGetStatus,
) {
  return apiV1TransfersGetStatus?.value;
}

String? apiV1TransfersGetStatusToJson(
  enums.ApiV1TransfersGetStatus apiV1TransfersGetStatus,
) {
  return apiV1TransfersGetStatus.value;
}

enums.ApiV1TransfersGetStatus apiV1TransfersGetStatusFromJson(
  Object? apiV1TransfersGetStatus, [
  enums.ApiV1TransfersGetStatus? defaultValue,
]) {
  return enums.ApiV1TransfersGetStatus.values.firstWhereOrNull(
        (e) => e.value == apiV1TransfersGetStatus,
      ) ??
      defaultValue ??
      enums.ApiV1TransfersGetStatus.swaggerGeneratedUnknown;
}

enums.ApiV1TransfersGetStatus? apiV1TransfersGetStatusNullableFromJson(
  Object? apiV1TransfersGetStatus, [
  enums.ApiV1TransfersGetStatus? defaultValue,
]) {
  if (apiV1TransfersGetStatus == null) {
    return null;
  }
  return enums.ApiV1TransfersGetStatus.values.firstWhereOrNull(
        (e) => e.value == apiV1TransfersGetStatus,
      ) ??
      defaultValue;
}

String apiV1TransfersGetStatusExplodedListToJson(
  List<enums.ApiV1TransfersGetStatus>? apiV1TransfersGetStatus,
) {
  return apiV1TransfersGetStatus?.map((e) => e.value!).join(',') ?? '';
}

List<String> apiV1TransfersGetStatusListToJson(
  List<enums.ApiV1TransfersGetStatus>? apiV1TransfersGetStatus,
) {
  if (apiV1TransfersGetStatus == null) {
    return [];
  }

  return apiV1TransfersGetStatus.map((e) => e.value!).toList();
}

List<enums.ApiV1TransfersGetStatus> apiV1TransfersGetStatusListFromJson(
  List? apiV1TransfersGetStatus, [
  List<enums.ApiV1TransfersGetStatus>? defaultValue,
]) {
  if (apiV1TransfersGetStatus == null) {
    return defaultValue ?? [];
  }

  return apiV1TransfersGetStatus
      .map((e) => apiV1TransfersGetStatusFromJson(e.toString()))
      .toList();
}

List<enums.ApiV1TransfersGetStatus>?
apiV1TransfersGetStatusNullableListFromJson(
  List? apiV1TransfersGetStatus, [
  List<enums.ApiV1TransfersGetStatus>? defaultValue,
]) {
  if (apiV1TransfersGetStatus == null) {
    return defaultValue;
  }

  return apiV1TransfersGetStatus
      .map((e) => apiV1TransfersGetStatusFromJson(e.toString()))
      .toList();
}

String? apiV1OrdersGetStatusNullableToJson(
  enums.ApiV1OrdersGetStatus? apiV1OrdersGetStatus,
) {
  return apiV1OrdersGetStatus?.value;
}

String? apiV1OrdersGetStatusToJson(
  enums.ApiV1OrdersGetStatus apiV1OrdersGetStatus,
) {
  return apiV1OrdersGetStatus.value;
}

enums.ApiV1OrdersGetStatus apiV1OrdersGetStatusFromJson(
  Object? apiV1OrdersGetStatus, [
  enums.ApiV1OrdersGetStatus? defaultValue,
]) {
  return enums.ApiV1OrdersGetStatus.values.firstWhereOrNull(
        (e) => e.value == apiV1OrdersGetStatus,
      ) ??
      defaultValue ??
      enums.ApiV1OrdersGetStatus.swaggerGeneratedUnknown;
}

enums.ApiV1OrdersGetStatus? apiV1OrdersGetStatusNullableFromJson(
  Object? apiV1OrdersGetStatus, [
  enums.ApiV1OrdersGetStatus? defaultValue,
]) {
  if (apiV1OrdersGetStatus == null) {
    return null;
  }
  return enums.ApiV1OrdersGetStatus.values.firstWhereOrNull(
        (e) => e.value == apiV1OrdersGetStatus,
      ) ??
      defaultValue;
}

String apiV1OrdersGetStatusExplodedListToJson(
  List<enums.ApiV1OrdersGetStatus>? apiV1OrdersGetStatus,
) {
  return apiV1OrdersGetStatus?.map((e) => e.value!).join(',') ?? '';
}

List<String> apiV1OrdersGetStatusListToJson(
  List<enums.ApiV1OrdersGetStatus>? apiV1OrdersGetStatus,
) {
  if (apiV1OrdersGetStatus == null) {
    return [];
  }

  return apiV1OrdersGetStatus.map((e) => e.value!).toList();
}

List<enums.ApiV1OrdersGetStatus> apiV1OrdersGetStatusListFromJson(
  List? apiV1OrdersGetStatus, [
  List<enums.ApiV1OrdersGetStatus>? defaultValue,
]) {
  if (apiV1OrdersGetStatus == null) {
    return defaultValue ?? [];
  }

  return apiV1OrdersGetStatus
      .map((e) => apiV1OrdersGetStatusFromJson(e.toString()))
      .toList();
}

List<enums.ApiV1OrdersGetStatus>? apiV1OrdersGetStatusNullableListFromJson(
  List? apiV1OrdersGetStatus, [
  List<enums.ApiV1OrdersGetStatus>? defaultValue,
]) {
  if (apiV1OrdersGetStatus == null) {
    return defaultValue;
  }

  return apiV1OrdersGetStatus
      .map((e) => apiV1OrdersGetStatusFromJson(e.toString()))
      .toList();
}

String? apiV1CashControlDepositsGetStatusNullableToJson(
  enums.ApiV1CashControlDepositsGetStatus? apiV1CashControlDepositsGetStatus,
) {
  return apiV1CashControlDepositsGetStatus?.value;
}

String? apiV1CashControlDepositsGetStatusToJson(
  enums.ApiV1CashControlDepositsGetStatus apiV1CashControlDepositsGetStatus,
) {
  return apiV1CashControlDepositsGetStatus.value;
}

enums.ApiV1CashControlDepositsGetStatus
apiV1CashControlDepositsGetStatusFromJson(
  Object? apiV1CashControlDepositsGetStatus, [
  enums.ApiV1CashControlDepositsGetStatus? defaultValue,
]) {
  return enums.ApiV1CashControlDepositsGetStatus.values.firstWhereOrNull(
        (e) => e.value == apiV1CashControlDepositsGetStatus,
      ) ??
      defaultValue ??
      enums.ApiV1CashControlDepositsGetStatus.swaggerGeneratedUnknown;
}

enums.ApiV1CashControlDepositsGetStatus?
apiV1CashControlDepositsGetStatusNullableFromJson(
  Object? apiV1CashControlDepositsGetStatus, [
  enums.ApiV1CashControlDepositsGetStatus? defaultValue,
]) {
  if (apiV1CashControlDepositsGetStatus == null) {
    return null;
  }
  return enums.ApiV1CashControlDepositsGetStatus.values.firstWhereOrNull(
        (e) => e.value == apiV1CashControlDepositsGetStatus,
      ) ??
      defaultValue;
}

String apiV1CashControlDepositsGetStatusExplodedListToJson(
  List<enums.ApiV1CashControlDepositsGetStatus>?
  apiV1CashControlDepositsGetStatus,
) {
  return apiV1CashControlDepositsGetStatus?.map((e) => e.value!).join(',') ??
      '';
}

List<String> apiV1CashControlDepositsGetStatusListToJson(
  List<enums.ApiV1CashControlDepositsGetStatus>?
  apiV1CashControlDepositsGetStatus,
) {
  if (apiV1CashControlDepositsGetStatus == null) {
    return [];
  }

  return apiV1CashControlDepositsGetStatus.map((e) => e.value!).toList();
}

List<enums.ApiV1CashControlDepositsGetStatus>
apiV1CashControlDepositsGetStatusListFromJson(
  List? apiV1CashControlDepositsGetStatus, [
  List<enums.ApiV1CashControlDepositsGetStatus>? defaultValue,
]) {
  if (apiV1CashControlDepositsGetStatus == null) {
    return defaultValue ?? [];
  }

  return apiV1CashControlDepositsGetStatus
      .map((e) => apiV1CashControlDepositsGetStatusFromJson(e.toString()))
      .toList();
}

List<enums.ApiV1CashControlDepositsGetStatus>?
apiV1CashControlDepositsGetStatusNullableListFromJson(
  List? apiV1CashControlDepositsGetStatus, [
  List<enums.ApiV1CashControlDepositsGetStatus>? defaultValue,
]) {
  if (apiV1CashControlDepositsGetStatus == null) {
    return defaultValue;
  }

  return apiV1CashControlDepositsGetStatus
      .map((e) => apiV1CashControlDepositsGetStatusFromJson(e.toString()))
      .toList();
}

String? apiV1CashControlDepositsVerificationQueueGetStatusNullableToJson(
  enums.ApiV1CashControlDepositsVerificationQueueGetStatus?
  apiV1CashControlDepositsVerificationQueueGetStatus,
) {
  return apiV1CashControlDepositsVerificationQueueGetStatus?.value;
}

String? apiV1CashControlDepositsVerificationQueueGetStatusToJson(
  enums.ApiV1CashControlDepositsVerificationQueueGetStatus
  apiV1CashControlDepositsVerificationQueueGetStatus,
) {
  return apiV1CashControlDepositsVerificationQueueGetStatus.value;
}

enums.ApiV1CashControlDepositsVerificationQueueGetStatus
apiV1CashControlDepositsVerificationQueueGetStatusFromJson(
  Object? apiV1CashControlDepositsVerificationQueueGetStatus, [
  enums.ApiV1CashControlDepositsVerificationQueueGetStatus? defaultValue,
]) {
  return enums.ApiV1CashControlDepositsVerificationQueueGetStatus.values
          .firstWhereOrNull(
            (e) =>
                e.value == apiV1CashControlDepositsVerificationQueueGetStatus,
          ) ??
      defaultValue ??
      enums
          .ApiV1CashControlDepositsVerificationQueueGetStatus
          .swaggerGeneratedUnknown;
}

enums.ApiV1CashControlDepositsVerificationQueueGetStatus?
apiV1CashControlDepositsVerificationQueueGetStatusNullableFromJson(
  Object? apiV1CashControlDepositsVerificationQueueGetStatus, [
  enums.ApiV1CashControlDepositsVerificationQueueGetStatus? defaultValue,
]) {
  if (apiV1CashControlDepositsVerificationQueueGetStatus == null) {
    return null;
  }
  return enums.ApiV1CashControlDepositsVerificationQueueGetStatus.values
          .firstWhereOrNull(
            (e) =>
                e.value == apiV1CashControlDepositsVerificationQueueGetStatus,
          ) ??
      defaultValue;
}

String apiV1CashControlDepositsVerificationQueueGetStatusExplodedListToJson(
  List<enums.ApiV1CashControlDepositsVerificationQueueGetStatus>?
  apiV1CashControlDepositsVerificationQueueGetStatus,
) {
  return apiV1CashControlDepositsVerificationQueueGetStatus
          ?.map((e) => e.value!)
          .join(',') ??
      '';
}

List<String> apiV1CashControlDepositsVerificationQueueGetStatusListToJson(
  List<enums.ApiV1CashControlDepositsVerificationQueueGetStatus>?
  apiV1CashControlDepositsVerificationQueueGetStatus,
) {
  if (apiV1CashControlDepositsVerificationQueueGetStatus == null) {
    return [];
  }

  return apiV1CashControlDepositsVerificationQueueGetStatus
      .map((e) => e.value!)
      .toList();
}

List<enums.ApiV1CashControlDepositsVerificationQueueGetStatus>
apiV1CashControlDepositsVerificationQueueGetStatusListFromJson(
  List? apiV1CashControlDepositsVerificationQueueGetStatus, [
  List<enums.ApiV1CashControlDepositsVerificationQueueGetStatus>? defaultValue,
]) {
  if (apiV1CashControlDepositsVerificationQueueGetStatus == null) {
    return defaultValue ?? [];
  }

  return apiV1CashControlDepositsVerificationQueueGetStatus
      .map(
        (e) => apiV1CashControlDepositsVerificationQueueGetStatusFromJson(
          e.toString(),
        ),
      )
      .toList();
}

List<enums.ApiV1CashControlDepositsVerificationQueueGetStatus>?
apiV1CashControlDepositsVerificationQueueGetStatusNullableListFromJson(
  List? apiV1CashControlDepositsVerificationQueueGetStatus, [
  List<enums.ApiV1CashControlDepositsVerificationQueueGetStatus>? defaultValue,
]) {
  if (apiV1CashControlDepositsVerificationQueueGetStatus == null) {
    return defaultValue;
  }

  return apiV1CashControlDepositsVerificationQueueGetStatus
      .map(
        (e) => apiV1CashControlDepositsVerificationQueueGetStatusFromJson(
          e.toString(),
        ),
      )
      .toList();
}

String? apiV1CashControlDepositsVarianceCasesGetStatusNullableToJson(
  enums.ApiV1CashControlDepositsVarianceCasesGetStatus?
  apiV1CashControlDepositsVarianceCasesGetStatus,
) {
  return apiV1CashControlDepositsVarianceCasesGetStatus?.value;
}

String? apiV1CashControlDepositsVarianceCasesGetStatusToJson(
  enums.ApiV1CashControlDepositsVarianceCasesGetStatus
  apiV1CashControlDepositsVarianceCasesGetStatus,
) {
  return apiV1CashControlDepositsVarianceCasesGetStatus.value;
}

enums.ApiV1CashControlDepositsVarianceCasesGetStatus
apiV1CashControlDepositsVarianceCasesGetStatusFromJson(
  Object? apiV1CashControlDepositsVarianceCasesGetStatus, [
  enums.ApiV1CashControlDepositsVarianceCasesGetStatus? defaultValue,
]) {
  return enums.ApiV1CashControlDepositsVarianceCasesGetStatus.values
          .firstWhereOrNull(
            (e) => e.value == apiV1CashControlDepositsVarianceCasesGetStatus,
          ) ??
      defaultValue ??
      enums
          .ApiV1CashControlDepositsVarianceCasesGetStatus
          .swaggerGeneratedUnknown;
}

enums.ApiV1CashControlDepositsVarianceCasesGetStatus?
apiV1CashControlDepositsVarianceCasesGetStatusNullableFromJson(
  Object? apiV1CashControlDepositsVarianceCasesGetStatus, [
  enums.ApiV1CashControlDepositsVarianceCasesGetStatus? defaultValue,
]) {
  if (apiV1CashControlDepositsVarianceCasesGetStatus == null) {
    return null;
  }
  return enums.ApiV1CashControlDepositsVarianceCasesGetStatus.values
          .firstWhereOrNull(
            (e) => e.value == apiV1CashControlDepositsVarianceCasesGetStatus,
          ) ??
      defaultValue;
}

String apiV1CashControlDepositsVarianceCasesGetStatusExplodedListToJson(
  List<enums.ApiV1CashControlDepositsVarianceCasesGetStatus>?
  apiV1CashControlDepositsVarianceCasesGetStatus,
) {
  return apiV1CashControlDepositsVarianceCasesGetStatus
          ?.map((e) => e.value!)
          .join(',') ??
      '';
}

List<String> apiV1CashControlDepositsVarianceCasesGetStatusListToJson(
  List<enums.ApiV1CashControlDepositsVarianceCasesGetStatus>?
  apiV1CashControlDepositsVarianceCasesGetStatus,
) {
  if (apiV1CashControlDepositsVarianceCasesGetStatus == null) {
    return [];
  }

  return apiV1CashControlDepositsVarianceCasesGetStatus
      .map((e) => e.value!)
      .toList();
}

List<enums.ApiV1CashControlDepositsVarianceCasesGetStatus>
apiV1CashControlDepositsVarianceCasesGetStatusListFromJson(
  List? apiV1CashControlDepositsVarianceCasesGetStatus, [
  List<enums.ApiV1CashControlDepositsVarianceCasesGetStatus>? defaultValue,
]) {
  if (apiV1CashControlDepositsVarianceCasesGetStatus == null) {
    return defaultValue ?? [];
  }

  return apiV1CashControlDepositsVarianceCasesGetStatus
      .map(
        (e) => apiV1CashControlDepositsVarianceCasesGetStatusFromJson(
          e.toString(),
        ),
      )
      .toList();
}

List<enums.ApiV1CashControlDepositsVarianceCasesGetStatus>?
apiV1CashControlDepositsVarianceCasesGetStatusNullableListFromJson(
  List? apiV1CashControlDepositsVarianceCasesGetStatus, [
  List<enums.ApiV1CashControlDepositsVarianceCasesGetStatus>? defaultValue,
]) {
  if (apiV1CashControlDepositsVarianceCasesGetStatus == null) {
    return defaultValue;
  }

  return apiV1CashControlDepositsVarianceCasesGetStatus
      .map(
        (e) => apiV1CashControlDepositsVarianceCasesGetStatusFromJson(
          e.toString(),
        ),
      )
      .toList();
}

typedef $JsonFactory<T> = T Function(Map<String, dynamic> json);

class $CustomJsonDecoder {
  $CustomJsonDecoder(this.factories);

  final Map<Type, $JsonFactory> factories;

  dynamic decode<T>(dynamic entity) {
    if (entity is Iterable) {
      return _decodeList<T>(entity);
    }

    if (entity is T) {
      return entity;
    }

    if (isTypeOf<T, Map>()) {
      return entity;
    }

    if (isTypeOf<T, Iterable>()) {
      return entity;
    }

    if (entity is Map<String, dynamic>) {
      return _decodeMap<T>(entity);
    }

    return entity;
  }

  T _decodeMap<T>(Map<String, dynamic> values) {
    final jsonFactory = factories[T];
    if (jsonFactory == null || jsonFactory is! $JsonFactory<T>) {
      return throw "Could not find factory for type $T. Is '$T: $T.fromJsonFactory' included in the CustomJsonDecoder instance creation in bootstrapper.dart?";
    }

    return jsonFactory(values);
  }

  List<T> _decodeList<T>(Iterable values) =>
      values.where((v) => v != null).map<T>((v) => decode<T>(v) as T).toList();
}

class $JsonSerializableConverter extends chopper.JsonConverter {
  @override
  FutureOr<chopper.Response<ResultType>> convertResponse<ResultType, Item>(
    chopper.Response response,
  ) async {
    if (response.bodyString.isEmpty) {
      // In rare cases, when let's say 204 (no content) is returned -
      // we cannot decode the missing json with the result type specified
      return chopper.Response(response.base, null, error: response.error);
    }

    if (ResultType == String) {
      return response.copyWith();
    }

    if (ResultType == DateTime) {
      return response.copyWith(
        body:
            DateTime.parse((response.body as String).replaceAll('"', ''))
                as ResultType,
      );
    }

    final jsonRes = await super.convertResponse(response);
    return jsonRes.copyWith<ResultType>(
      body: $jsonDecoder.decode<Item>(jsonRes.body) as ResultType,
    );
  }
}

final $jsonDecoder = $CustomJsonDecoder(generatedMapping);

// ignore: unused_element
String? _dateToJson(DateTime? date) {
  if (date == null) {
    return null;
  }

  final year = date.year.toString();
  final month = date.month < 10 ? '0${date.month}' : date.month.toString();
  final day = date.day < 10 ? '0${date.day}' : date.day.toString();

  return '$year-$month-$day';
}

class Wrapped<T> {
  final T value;
  const Wrapped.value(this.value);
}
