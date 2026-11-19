// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'buyme.swagger.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RequestCustomerOtpDto _$RequestCustomerOtpDtoFromJson(
  Map<String, dynamic> json,
) => RequestCustomerOtpDto(phone: json['phone'] as String);

Map<String, dynamic> _$RequestCustomerOtpDtoToJson(
  RequestCustomerOtpDto instance,
) => <String, dynamic>{'phone': instance.phone};

VerifyCustomerOtpDto _$VerifyCustomerOtpDtoFromJson(
  Map<String, dynamic> json,
) => VerifyCustomerOtpDto(
  phone: json['phone'] as String,
  code: json['code'] as String,
  deviceId: json['deviceId'] as String,
  deviceInfo: json['deviceInfo'] as String?,
);

Map<String, dynamic> _$VerifyCustomerOtpDtoToJson(
  VerifyCustomerOtpDto instance,
) => <String, dynamic>{
  'phone': instance.phone,
  'code': instance.code,
  'deviceId': instance.deviceId,
  'deviceInfo': instance.deviceInfo,
};

RequestRiderOtpDto _$RequestRiderOtpDtoFromJson(Map<String, dynamic> json) =>
    RequestRiderOtpDto(destination: json['destination'] as String);

Map<String, dynamic> _$RequestRiderOtpDtoToJson(RequestRiderOtpDto instance) =>
    <String, dynamic>{'destination': instance.destination};

VerifyRiderOtpDto _$VerifyRiderOtpDtoFromJson(Map<String, dynamic> json) =>
    VerifyRiderOtpDto(
      destination: json['destination'] as String,
      code: json['code'] as String,
      deviceId: json['deviceId'] as String,
      deviceInfo: json['deviceInfo'] as String?,
    );

Map<String, dynamic> _$VerifyRiderOtpDtoToJson(VerifyRiderOtpDto instance) =>
    <String, dynamic>{
      'destination': instance.destination,
      'code': instance.code,
      'deviceId': instance.deviceId,
      'deviceInfo': instance.deviceInfo,
    };

RequestRiderRegistrationOtpDto _$RequestRiderRegistrationOtpDtoFromJson(
  Map<String, dynamic> json,
) => RequestRiderRegistrationOtpDto(
  fullName: json['fullName'] as String,
  phone: json['phone'] as String,
  email: json['email'] as String?,
);

Map<String, dynamic> _$RequestRiderRegistrationOtpDtoToJson(
  RequestRiderRegistrationOtpDto instance,
) => <String, dynamic>{
  'fullName': instance.fullName,
  'phone': instance.phone,
  'email': instance.email,
};

VerifyRiderRegistrationOtpDto _$VerifyRiderRegistrationOtpDtoFromJson(
  Map<String, dynamic> json,
) => VerifyRiderRegistrationOtpDto(
  fullName: json['fullName'] as String,
  phone: json['phone'] as String,
  email: json['email'] as String?,
  code: json['code'] as String,
  deviceId: json['deviceId'] as String,
  deviceInfo: json['deviceInfo'] as String?,
);

Map<String, dynamic> _$VerifyRiderRegistrationOtpDtoToJson(
  VerifyRiderRegistrationOtpDto instance,
) => <String, dynamic>{
  'fullName': instance.fullName,
  'phone': instance.phone,
  'email': instance.email,
  'code': instance.code,
  'deviceId': instance.deviceId,
  'deviceInfo': instance.deviceInfo,
};

AdminLoginDto _$AdminLoginDtoFromJson(Map<String, dynamic> json) =>
    AdminLoginDto(
      email: json['email'] as String,
      password: json['password'] as String,
      deviceId: json['deviceId'] as String,
      deviceInfo: json['deviceInfo'] as String?,
    );

Map<String, dynamic> _$AdminLoginDtoToJson(AdminLoginDto instance) =>
    <String, dynamic>{
      'email': instance.email,
      'password': instance.password,
      'deviceId': instance.deviceId,
      'deviceInfo': instance.deviceInfo,
    };

AdminVerify2faDto _$AdminVerify2faDtoFromJson(Map<String, dynamic> json) =>
    AdminVerify2faDto(
      email: json['email'] as String,
      code: json['code'] as String,
      deviceId: json['deviceId'] as String,
      deviceInfo: json['deviceInfo'] as String?,
    );

Map<String, dynamic> _$AdminVerify2faDtoToJson(AdminVerify2faDto instance) =>
    <String, dynamic>{
      'email': instance.email,
      'code': instance.code,
      'deviceId': instance.deviceId,
      'deviceInfo': instance.deviceInfo,
    };

RefreshTokenDto _$RefreshTokenDtoFromJson(Map<String, dynamic> json) =>
    RefreshTokenDto(
      refreshToken: json['refreshToken'] as String,
      deviceId: json['deviceId'] as String?,
    );

Map<String, dynamic> _$RefreshTokenDtoToJson(RefreshTokenDto instance) =>
    <String, dynamic>{
      'refreshToken': instance.refreshToken,
      'deviceId': instance.deviceId,
    };

RegisterPushTokenDto _$RegisterPushTokenDtoFromJson(
  Map<String, dynamic> json,
) => RegisterPushTokenDto(
  deviceId: json['deviceId'] as String,
  pushToken: json['pushToken'] as String,
);

Map<String, dynamic> _$RegisterPushTokenDtoToJson(
  RegisterPushTokenDto instance,
) => <String, dynamic>{
  'deviceId': instance.deviceId,
  'pushToken': instance.pushToken,
};

UpdateStoreStatusDto _$UpdateStoreStatusDtoFromJson(
  Map<String, dynamic> json,
) => UpdateStoreStatusDto(isActive: json['isActive'] as bool);

Map<String, dynamic> _$UpdateStoreStatusDtoToJson(
  UpdateStoreStatusDto instance,
) => <String, dynamic>{'isActive': instance.isActive};

UpdateStoreSettingsDto _$UpdateStoreSettingsDtoFromJson(
  Map<String, dynamic> json,
) => UpdateStoreSettingsDto(
  minOrderAmount: (json['minOrderAmount'] as num?)?.toDouble(),
  freeDeliveryThreshold: (json['freeDeliveryThreshold'] as num?)?.toDouble(),
  cashHoldThreshold: (json['cashHoldThreshold'] as num?)?.toDouble(),
  cashHoldMaxHours: (json['cashHoldMaxHours'] as num?)?.toDouble(),
  openingTime: json['openingTime'] as String?,
  closingTime: json['closingTime'] as String?,
  serviceRadiusKm: (json['serviceRadiusKm'] as num?)?.toDouble(),
);

Map<String, dynamic> _$UpdateStoreSettingsDtoToJson(
  UpdateStoreSettingsDto instance,
) => <String, dynamic>{
  'minOrderAmount': instance.minOrderAmount,
  'freeDeliveryThreshold': instance.freeDeliveryThreshold,
  'cashHoldThreshold': instance.cashHoldThreshold,
  'cashHoldMaxHours': instance.cashHoldMaxHours,
  'openingTime': instance.openingTime,
  'closingTime': instance.closingTime,
  'serviceRadiusKm': instance.serviceRadiusKm,
};

UpdateDeliveryZonePricingDto _$UpdateDeliveryZonePricingDtoFromJson(
  Map<String, dynamic> json,
) => UpdateDeliveryZonePricingDto(
  baseFee: (json['baseFee'] as num?)?.toDouble(),
  minOrderForFreeDelivery: (json['minOrderForFreeDelivery'] as num?)
      ?.toDouble(),
  estimatedDeliveryMins: (json['estimatedDeliveryMins'] as num?)?.toDouble(),
  isActive: json['isActive'] as bool?,
);

Map<String, dynamic> _$UpdateDeliveryZonePricingDtoToJson(
  UpdateDeliveryZonePricingDto instance,
) => <String, dynamic>{
  'baseFee': instance.baseFee,
  'minOrderForFreeDelivery': instance.minOrderForFreeDelivery,
  'estimatedDeliveryMins': instance.estimatedDeliveryMins,
  'isActive': instance.isActive,
};

FindNearestStoreDto _$FindNearestStoreDtoFromJson(Map<String, dynamic> json) =>
    FindNearestStoreDto(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
    );

Map<String, dynamic> _$FindNearestStoreDtoToJson(
  FindNearestStoreDto instance,
) => <String, dynamic>{
  'latitude': instance.latitude,
  'longitude': instance.longitude,
};

CreateCategoryDto _$CreateCategoryDtoFromJson(Map<String, dynamic> json) =>
    CreateCategoryDto(
      name: json['name'] as String,
      slug: json['slug'] as String,
      nameTa: json['nameTa'] as String?,
      icon: json['icon'] as String?,
      imageUrl: json['imageUrl'] as String?,
      sortOrder: (json['sortOrder'] as num?)?.toDouble(),
      isActive: json['isActive'] as bool? ?? true,
    );

Map<String, dynamic> _$CreateCategoryDtoToJson(CreateCategoryDto instance) =>
    <String, dynamic>{
      'name': instance.name,
      'slug': instance.slug,
      'nameTa': instance.nameTa,
      'icon': instance.icon,
      'imageUrl': instance.imageUrl,
      'sortOrder': instance.sortOrder,
      'isActive': instance.isActive,
    };

UpdateCategoryDto _$UpdateCategoryDtoFromJson(Map<String, dynamic> json) =>
    UpdateCategoryDto(
      name: json['name'] as String?,
      slug: json['slug'] as String?,
      nameTa: json['nameTa'] as String?,
      icon: json['icon'] as String?,
      imageUrl: json['imageUrl'] as String?,
      sortOrder: (json['sortOrder'] as num?)?.toDouble(),
      isActive: json['isActive'] as bool? ?? true,
    );

Map<String, dynamic> _$UpdateCategoryDtoToJson(UpdateCategoryDto instance) =>
    <String, dynamic>{
      'name': instance.name,
      'slug': instance.slug,
      'nameTa': instance.nameTa,
      'icon': instance.icon,
      'imageUrl': instance.imageUrl,
      'sortOrder': instance.sortOrder,
      'isActive': instance.isActive,
    };

CreateProductDto _$CreateProductDtoFromJson(Map<String, dynamic> json) =>
    CreateProductDto(
      sku: json['sku'] as String,
      barcodes:
          (json['barcodes'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      name: json['name'] as String,
      nameTa: json['nameTa'] as String?,
      description: json['description'] as String?,
      categoryId: json['categoryId'] as String,
      unit: json['unit'] as String,
      costPrice: (json['costPrice'] as num).toDouble(),
      baseSellingPrice: (json['baseSellingPrice'] as num).toDouble(),
      isActive: json['isActive'] as bool? ?? true,
    );

Map<String, dynamic> _$CreateProductDtoToJson(CreateProductDto instance) =>
    <String, dynamic>{
      'sku': instance.sku,
      'barcodes': instance.barcodes,
      'name': instance.name,
      'nameTa': instance.nameTa,
      'description': instance.description,
      'categoryId': instance.categoryId,
      'unit': instance.unit,
      'costPrice': instance.costPrice,
      'baseSellingPrice': instance.baseSellingPrice,
      'isActive': instance.isActive,
    };

UpdateProductDto _$UpdateProductDtoFromJson(Map<String, dynamic> json) =>
    UpdateProductDto(
      sku: json['sku'] as String?,
      barcodes:
          (json['barcodes'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      name: json['name'] as String?,
      nameTa: json['nameTa'] as String?,
      description: json['description'] as String?,
      categoryId: json['categoryId'] as String?,
      unit: json['unit'] as String?,
      costPrice: (json['costPrice'] as num?)?.toDouble(),
      baseSellingPrice: (json['baseSellingPrice'] as num?)?.toDouble(),
      isActive: json['isActive'] as bool? ?? true,
    );

Map<String, dynamic> _$UpdateProductDtoToJson(UpdateProductDto instance) =>
    <String, dynamic>{
      'sku': instance.sku,
      'barcodes': instance.barcodes,
      'name': instance.name,
      'nameTa': instance.nameTa,
      'description': instance.description,
      'categoryId': instance.categoryId,
      'unit': instance.unit,
      'costPrice': instance.costPrice,
      'baseSellingPrice': instance.baseSellingPrice,
      'isActive': instance.isActive,
    };

AdjustStockDto _$AdjustStockDtoFromJson(Map<String, dynamic> json) =>
    AdjustStockDto(
      quantityDelta: (json['quantityDelta'] as num).toDouble(),
      reason: json['reason'] as String,
    );

Map<String, dynamic> _$AdjustStockDtoToJson(AdjustStockDto instance) =>
    <String, dynamic>{
      'quantityDelta': instance.quantityDelta,
      'reason': instance.reason,
    };

UpdateReorderLevelDto _$UpdateReorderLevelDtoFromJson(
  Map<String, dynamic> json,
) => UpdateReorderLevelDto(
  reorderLevel: (json['reorderLevel'] as num).toDouble(),
);

Map<String, dynamic> _$UpdateReorderLevelDtoToJson(
  UpdateReorderLevelDto instance,
) => <String, dynamic>{'reorderLevel': instance.reorderLevel};

UpdateStoreCatalogDto _$UpdateStoreCatalogDtoFromJson(
  Map<String, dynamic> json,
) => UpdateStoreCatalogDto(
  customPrice: json['customPrice'],
  isAvailable: json['isAvailable'] as bool?,
  reorderLevel: (json['reorderLevel'] as num?)?.toDouble(),
);

Map<String, dynamic> _$UpdateStoreCatalogDtoToJson(
  UpdateStoreCatalogDto instance,
) => <String, dynamic>{
  'customPrice': instance.customPrice,
  'isAvailable': instance.isAvailable,
  'reorderLevel': instance.reorderLevel,
};

TransferLineDto _$TransferLineDtoFromJson(Map<String, dynamic> json) =>
    TransferLineDto(
      productId: json['productId'] as String,
      requestedQuantity: (json['requestedQuantity'] as num).toDouble(),
    );

Map<String, dynamic> _$TransferLineDtoToJson(TransferLineDto instance) =>
    <String, dynamic>{
      'productId': instance.productId,
      'requestedQuantity': instance.requestedQuantity,
    };

CreateTransferDto _$CreateTransferDtoFromJson(Map<String, dynamic> json) =>
    CreateTransferDto(
      storeId: json['storeId'] as String,
      items:
          (json['items'] as List<dynamic>?)
              ?.map((e) => TransferLineDto.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );

Map<String, dynamic> _$CreateTransferDtoToJson(CreateTransferDto instance) =>
    <String, dynamic>{
      'storeId': instance.storeId,
      'items': instance.items.map((e) => e.toJson()).toList(),
    };

ReceiveTransferLineDto _$ReceiveTransferLineDtoFromJson(
  Map<String, dynamic> json,
) => ReceiveTransferLineDto(
  productId: json['productId'] as String,
  receivedQuantity: (json['receivedQuantity'] as num).toDouble(),
  notes: json['notes'] as String?,
);

Map<String, dynamic> _$ReceiveTransferLineDtoToJson(
  ReceiveTransferLineDto instance,
) => <String, dynamic>{
  'productId': instance.productId,
  'receivedQuantity': instance.receivedQuantity,
  'notes': instance.notes,
};

ReceiveTransferDto _$ReceiveTransferDtoFromJson(Map<String, dynamic> json) =>
    ReceiveTransferDto(
      items:
          (json['items'] as List<dynamic>?)
              ?.map(
                (e) =>
                    ReceiveTransferLineDto.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          [],
    );

Map<String, dynamic> _$ReceiveTransferDtoToJson(ReceiveTransferDto instance) =>
    <String, dynamic>{'items': instance.items.map((e) => e.toJson()).toList()};

ResolveTransferLineDto _$ResolveTransferLineDtoFromJson(
  Map<String, dynamic> json,
) => ResolveTransferLineDto(
  productId: json['productId'] as String,
  resolution: resolveTransferLineDtoResolutionFromJson(json['resolution']),
);

Map<String, dynamic> _$ResolveTransferLineDtoToJson(
  ResolveTransferLineDto instance,
) => <String, dynamic>{
  'productId': instance.productId,
  'resolution': resolveTransferLineDtoResolutionToJson(instance.resolution),
};

ResolveTransferDto _$ResolveTransferDtoFromJson(Map<String, dynamic> json) =>
    ResolveTransferDto(
      resolutionNote: json['resolutionNote'] as String,
      items:
          (json['items'] as List<dynamic>?)
              ?.map(
                (e) =>
                    ResolveTransferLineDto.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          [],
    );

Map<String, dynamic> _$ResolveTransferDtoToJson(ResolveTransferDto instance) =>
    <String, dynamic>{
      'resolutionNote': instance.resolutionNote,
      'items': instance.items.map((e) => e.toJson()).toList(),
    };

CreateOrderItemDto _$CreateOrderItemDtoFromJson(Map<String, dynamic> json) =>
    CreateOrderItemDto(
      storeProductId: json['storeProductId'] as String,
      quantity: (json['quantity'] as num).toDouble(),
    );

Map<String, dynamic> _$CreateOrderItemDtoToJson(CreateOrderItemDto instance) =>
    <String, dynamic>{
      'storeProductId': instance.storeProductId,
      'quantity': instance.quantity,
    };

CreateOrderDto _$CreateOrderDtoFromJson(Map<String, dynamic> json) =>
    CreateOrderDto(
      storeId: json['storeId'] as String,
      deliveryAddressId: json['deliveryAddressId'] as String,
      deliveryZoneId: json['deliveryZoneId'] as String?,
      campaignCodes:
          (json['campaignCodes'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      items:
          (json['items'] as List<dynamic>?)
              ?.map(
                (e) => CreateOrderItemDto.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          [],
    );

Map<String, dynamic> _$CreateOrderDtoToJson(CreateOrderDto instance) =>
    <String, dynamic>{
      'storeId': instance.storeId,
      'deliveryAddressId': instance.deliveryAddressId,
      'deliveryZoneId': instance.deliveryZoneId,
      'campaignCodes': instance.campaignCodes,
      'items': instance.items.map((e) => e.toJson()).toList(),
    };

CheckoutOrderDto _$CheckoutOrderDtoFromJson(Map<String, dynamic> json) =>
    CheckoutOrderDto(
      storeId: json['storeId'] as String,
      deliveryAddressId: json['deliveryAddressId'] as String,
      deliveryZoneId: json['deliveryZoneId'] as String?,
      campaignCodes:
          (json['campaignCodes'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
    );

Map<String, dynamic> _$CheckoutOrderDtoToJson(CheckoutOrderDto instance) =>
    <String, dynamic>{
      'storeId': instance.storeId,
      'deliveryAddressId': instance.deliveryAddressId,
      'deliveryZoneId': instance.deliveryZoneId,
      'campaignCodes': instance.campaignCodes,
    };

OrderReasonDto _$OrderReasonDtoFromJson(Map<String, dynamic> json) =>
    OrderReasonDto(reason: json['reason'] as String);

Map<String, dynamic> _$OrderReasonDtoToJson(OrderReasonDto instance) =>
    <String, dynamic>{'reason': instance.reason};

OrderNoteDto _$OrderNoteDtoFromJson(Map<String, dynamic> json) =>
    OrderNoteDto(note: json['note'] as String?);

Map<String, dynamic> _$OrderNoteDtoToJson(OrderNoteDto instance) =>
    <String, dynamic>{'note': instance.note};

AssignOrderRiderDto _$AssignOrderRiderDtoFromJson(Map<String, dynamic> json) =>
    AssignOrderRiderDto(riderId: json['riderId'] as String);

Map<String, dynamic> _$AssignOrderRiderDtoToJson(
  AssignOrderRiderDto instance,
) => <String, dynamic>{'riderId': instance.riderId};

DeliverOrderDto _$DeliverOrderDtoFromJson(Map<String, dynamic> json) =>
    DeliverOrderDto(
      collectedAmount: (json['collectedAmount'] as num).toDouble(),
    );

Map<String, dynamic> _$DeliverOrderDtoToJson(DeliverOrderDto instance) =>
    <String, dynamic>{'collectedAmount': instance.collectedAmount};

CartItemInputDto _$CartItemInputDtoFromJson(Map<String, dynamic> json) =>
    CartItemInputDto(
      storeProductId: json['storeProductId'] as String,
      quantity: (json['quantity'] as num).toDouble(),
    );

Map<String, dynamic> _$CartItemInputDtoToJson(CartItemInputDto instance) =>
    <String, dynamic>{
      'storeProductId': instance.storeProductId,
      'quantity': instance.quantity,
    };

CartItemQuantityDto _$CartItemQuantityDtoFromJson(Map<String, dynamic> json) =>
    CartItemQuantityDto(quantity: (json['quantity'] as num).toDouble());

Map<String, dynamic> _$CartItemQuantityDtoToJson(
  CartItemQuantityDto instance,
) => <String, dynamic>{'quantity': instance.quantity};

DepositUploadUrlDto _$DepositUploadUrlDtoFromJson(Map<String, dynamic> json) =>
    DepositUploadUrlDto(
      contentType: depositUploadUrlDtoContentTypeFromJson(json['contentType']),
      contentLength: (json['contentLength'] as num).toDouble(),
    );

Map<String, dynamic> _$DepositUploadUrlDtoToJson(
  DepositUploadUrlDto instance,
) => <String, dynamic>{
  'contentType': depositUploadUrlDtoContentTypeToJson(instance.contentType),
  'contentLength': instance.contentLength,
};

CreateRiderDepositDto _$CreateRiderDepositDtoFromJson(
  Map<String, dynamic> json,
) => CreateRiderDepositDto(
  amount: (json['amount'] as num).toDouble(),
  bankRefNumber: json['bankRefNumber'] as String,
  objectKey: json['objectKey'] as String,
);

Map<String, dynamic> _$CreateRiderDepositDtoToJson(
  CreateRiderDepositDto instance,
) => <String, dynamic>{
  'amount': instance.amount,
  'bankRefNumber': instance.bankRefNumber,
  'objectKey': instance.objectKey,
};

VerifyRiderDepositDto _$VerifyRiderDepositDtoFromJson(
  Map<String, dynamic> json,
) => VerifyRiderDepositDto(
  action: verifyRiderDepositDtoActionFromJson(json['action']),
  rejectionReason: json['rejectionReason'] as String?,
  receivedAmount: (json['receivedAmount'] as num?)?.toDouble(),
  varianceReason: json['varianceReason'] as String?,
);

Map<String, dynamic> _$VerifyRiderDepositDtoToJson(
  VerifyRiderDepositDto instance,
) => <String, dynamic>{
  'action': verifyRiderDepositDtoActionToJson(instance.action),
  'rejectionReason': instance.rejectionReason,
  'receivedAmount': instance.receivedAmount,
  'varianceReason': instance.varianceReason,
};

ResolveDepositVarianceDto _$ResolveDepositVarianceDtoFromJson(
  Map<String, dynamic> json,
) => ResolveDepositVarianceDto(
  action: resolveDepositVarianceDtoActionFromJson(json['action']),
  resolutionNote: json['resolutionNote'] as String,
);

Map<String, dynamic> _$ResolveDepositVarianceDtoToJson(
  ResolveDepositVarianceDto instance,
) => <String, dynamic>{
  'action': resolveDepositVarianceDtoActionToJson(instance.action),
  'resolutionNote': instance.resolutionNote,
};

CreateCampaignDto _$CreateCampaignDtoFromJson(Map<String, dynamic> json) =>
    CreateCampaignDto(
      name: json['name'] as String,
      storeId: json['storeId'] as String?,
      code: json['code'] as String?,
      type: createCampaignDtoTypeFromJson(json['type']),
      value: (json['value'] as num).toDouble(),
      minSubtotal: (json['minSubtotal'] as num?)?.toDouble(),
      maxDiscount: (json['maxDiscount'] as num?)?.toDouble(),
      startsAt: DateTime.parse(json['startsAt'] as String),
      endsAt: DateTime.parse(json['endsAt'] as String),
    );

Map<String, dynamic> _$CreateCampaignDtoToJson(CreateCampaignDto instance) =>
    <String, dynamic>{
      'name': instance.name,
      'storeId': instance.storeId,
      'code': instance.code,
      'type': createCampaignDtoTypeToJson(instance.type),
      'value': instance.value,
      'minSubtotal': instance.minSubtotal,
      'maxDiscount': instance.maxDiscount,
      'startsAt': instance.startsAt.toIso8601String(),
      'endsAt': instance.endsAt.toIso8601String(),
    };

UpdateCampaignDto _$UpdateCampaignDtoFromJson(Map<String, dynamic> json) =>
    UpdateCampaignDto(
      name: json['name'] as String?,
      value: (json['value'] as num?)?.toDouble(),
      minSubtotal: (json['minSubtotal'] as num?)?.toDouble(),
      maxDiscount: (json['maxDiscount'] as num?)?.toDouble(),
      startsAt: json['startsAt'] == null
          ? null
          : DateTime.parse(json['startsAt'] as String),
      endsAt: json['endsAt'] == null
          ? null
          : DateTime.parse(json['endsAt'] as String),
      isActive: json['isActive'] as bool?,
    );

Map<String, dynamic> _$UpdateCampaignDtoToJson(UpdateCampaignDto instance) =>
    <String, dynamic>{
      'name': instance.name,
      'value': instance.value,
      'minSubtotal': instance.minSubtotal,
      'maxDiscount': instance.maxDiscount,
      'startsAt': instance.startsAt?.toIso8601String(),
      'endsAt': instance.endsAt?.toIso8601String(),
      'isActive': instance.isActive,
    };

KycUploadUrlDto _$KycUploadUrlDtoFromJson(Map<String, dynamic> json) =>
    KycUploadUrlDto(
      contentType: kycUploadUrlDtoContentTypeFromJson(json['contentType']),
      contentLength: (json['contentLength'] as num).toDouble(),
    );

Map<String, dynamic> _$KycUploadUrlDtoToJson(KycUploadUrlDto instance) =>
    <String, dynamic>{
      'contentType': kycUploadUrlDtoContentTypeToJson(instance.contentType),
      'contentLength': instance.contentLength,
    };

SubmitRiderKycDto _$SubmitRiderKycDtoFromJson(Map<String, dynamic> json) =>
    SubmitRiderKycDto(
      bikeNumber: json['bikeNumber'] as String,
      drivingLicenceObjectKey: json['drivingLicenceObjectKey'] as String,
      vehicleLicenceObjectKey: json['vehicleLicenceObjectKey'] as String,
    );

Map<String, dynamic> _$SubmitRiderKycDtoToJson(SubmitRiderKycDto instance) =>
    <String, dynamic>{
      'bikeNumber': instance.bikeNumber,
      'drivingLicenceObjectKey': instance.drivingLicenceObjectKey,
      'vehicleLicenceObjectKey': instance.vehicleLicenceObjectKey,
    };

ApproveRiderKycDto _$ApproveRiderKycDtoFromJson(Map<String, dynamic> json) =>
    ApproveRiderKycDto(
      storeId: json['storeId'] as String,
      riderType: approveRiderKycDtoRiderTypeFromJson(json['riderType']),
    );

Map<String, dynamic> _$ApproveRiderKycDtoToJson(ApproveRiderKycDto instance) =>
    <String, dynamic>{
      'storeId': instance.storeId,
      'riderType': approveRiderKycDtoRiderTypeToJson(instance.riderType),
    };

RejectRiderKycDto _$RejectRiderKycDtoFromJson(Map<String, dynamic> json) =>
    RejectRiderKycDto(reason: json['reason'] as String);

Map<String, dynamic> _$RejectRiderKycDtoToJson(RejectRiderKycDto instance) =>
    <String, dynamic>{'reason': instance.reason};

SuspendRiderDto _$SuspendRiderDtoFromJson(Map<String, dynamic> json) =>
    SuspendRiderDto(reason: json['reason'] as String);

Map<String, dynamic> _$SuspendRiderDtoToJson(SuspendRiderDto instance) =>
    <String, dynamic>{'reason': instance.reason};

CreateAddressDto _$CreateAddressDtoFromJson(Map<String, dynamic> json) =>
    CreateAddressDto(
      label: json['label'] as String,
      recipientName: json['recipientName'] as String,
      recipientPhone: json['recipientPhone'] as String,
      streetAddress: json['streetAddress'] as String,
      landmark: json['landmark'] as String?,
      locality: json['locality'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      isDefault: json['isDefault'] as bool?,
    );

Map<String, dynamic> _$CreateAddressDtoToJson(CreateAddressDto instance) =>
    <String, dynamic>{
      'label': instance.label,
      'recipientName': instance.recipientName,
      'recipientPhone': instance.recipientPhone,
      'streetAddress': instance.streetAddress,
      'landmark': instance.landmark,
      'locality': instance.locality,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'isDefault': instance.isDefault,
    };

UpdateAddressDto _$UpdateAddressDtoFromJson(Map<String, dynamic> json) =>
    UpdateAddressDto(
      label: json['label'] as String?,
      recipientName: json['recipientName'] as String?,
      recipientPhone: json['recipientPhone'] as String?,
      streetAddress: json['streetAddress'] as String?,
      landmark: json['landmark'] as String?,
      locality: json['locality'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      isDefault: json['isDefault'] as bool?,
    );

Map<String, dynamic> _$UpdateAddressDtoToJson(UpdateAddressDto instance) =>
    <String, dynamic>{
      'label': instance.label,
      'recipientName': instance.recipientName,
      'recipientPhone': instance.recipientPhone,
      'streetAddress': instance.streetAddress,
      'landmark': instance.landmark,
      'locality': instance.locality,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'isDefault': instance.isDefault,
    };

ApiV1ProductsIdImagePost$RequestBody
_$ApiV1ProductsIdImagePost$RequestBodyFromJson(Map<String, dynamic> json) =>
    ApiV1ProductsIdImagePost$RequestBody(image: json['image'] as String);

Map<String, dynamic> _$ApiV1ProductsIdImagePost$RequestBodyToJson(
  ApiV1ProductsIdImagePost$RequestBody instance,
) => <String, dynamic>{'image': instance.image};
