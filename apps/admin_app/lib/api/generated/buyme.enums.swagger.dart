// coverage:ignore-file
// ignore_for_file: type=lint

import 'package:json_annotation/json_annotation.dart';
import 'package:collection/collection.dart';

enum ResolveTransferLineDtoResolution {
  @JsonValue(null)
  swaggerGeneratedUnknown(null),

  @JsonValue('WRITE_OFF')
  writeOff('WRITE_OFF'),
  @JsonValue('RETURN_TO_WAREHOUSE')
  returnToWarehouse('RETURN_TO_WAREHOUSE');

  final String? value;

  const ResolveTransferLineDtoResolution(this.value);
}

enum DepositUploadUrlDtoContentType {
  @JsonValue(null)
  swaggerGeneratedUnknown(null),

  @JsonValue('image/jpeg')
  imageJpeg('image/jpeg'),
  @JsonValue('image/png')
  imagePng('image/png'),
  @JsonValue('application/pdf')
  applicationPdf('application/pdf');

  final String? value;

  const DepositUploadUrlDtoContentType(this.value);
}

enum VerifyRiderDepositDtoAction {
  @JsonValue(null)
  swaggerGeneratedUnknown(null),

  @JsonValue('APPROVE')
  approve('APPROVE'),
  @JsonValue('REJECT')
  reject('REJECT'),
  @JsonValue('VARIANCE')
  variance('VARIANCE');

  final String? value;

  const VerifyRiderDepositDtoAction(this.value);
}

enum ResolveDepositVarianceDtoAction {
  @JsonValue(null)
  swaggerGeneratedUnknown(null),

  @JsonValue('ACCEPT_VARIANCE')
  acceptVariance('ACCEPT_VARIANCE'),
  @JsonValue('REJECT_DEPOSIT')
  rejectDeposit('REJECT_DEPOSIT');

  final String? value;

  const ResolveDepositVarianceDtoAction(this.value);
}

enum CreateCampaignDtoType {
  @JsonValue(null)
  swaggerGeneratedUnknown(null),

  @JsonValue('FREE_DELIVERY')
  freeDelivery('FREE_DELIVERY'),
  @JsonValue('FIXED_DISCOUNT')
  fixedDiscount('FIXED_DISCOUNT'),
  @JsonValue('PERCENTAGE_DISCOUNT')
  percentageDiscount('PERCENTAGE_DISCOUNT');

  final String? value;

  const CreateCampaignDtoType(this.value);
}

enum KycUploadUrlDtoContentType {
  @JsonValue(null)
  swaggerGeneratedUnknown(null),

  @JsonValue('image/jpeg')
  imageJpeg('image/jpeg'),
  @JsonValue('image/png')
  imagePng('image/png'),
  @JsonValue('image/webp')
  imageWebp('image/webp');

  final String? value;

  const KycUploadUrlDtoContentType(this.value);
}

enum ApproveRiderKycDtoRiderType {
  @JsonValue(null)
  swaggerGeneratedUnknown(null),

  @JsonValue('EMPLOYEE')
  employee('EMPLOYEE'),
  @JsonValue('FREELANCE')
  freelance('FREELANCE');

  final String? value;

  const ApproveRiderKycDtoRiderType(this.value);
}

enum ApiV1TransfersGetStatus {
  @JsonValue(null)
  swaggerGeneratedUnknown(null),

  @JsonValue('DRAFT')
  draft('DRAFT'),
  @JsonValue('DISPATCHED')
  dispatched('DISPATCHED'),
  @JsonValue('RECEIVED_FULL')
  receivedFull('RECEIVED_FULL'),
  @JsonValue('RECEIVED_PARTIAL')
  receivedPartial('RECEIVED_PARTIAL'),
  @JsonValue('RESOLVED')
  resolved('RESOLVED'),
  @JsonValue('CANCELLED')
  cancelled('CANCELLED');

  final String? value;

  const ApiV1TransfersGetStatus(this.value);
}

enum ApiV1OrdersGetStatus {
  @JsonValue(null)
  swaggerGeneratedUnknown(null),

  @JsonValue('PLACED')
  placed('PLACED'),
  @JsonValue('ACCEPTED')
  accepted('ACCEPTED'),
  @JsonValue('REJECTED')
  rejected('REJECTED'),
  @JsonValue('PREPARING')
  preparing('PREPARING'),
  @JsonValue('READY')
  ready('READY'),
  @JsonValue('RIDER_ASSIGNED')
  riderAssigned('RIDER_ASSIGNED'),
  @JsonValue('PICKED_UP')
  pickedUp('PICKED_UP'),
  @JsonValue('ON_THE_WAY')
  onTheWay('ON_THE_WAY'),
  @JsonValue('DELIVERED')
  delivered('DELIVERED'),
  @JsonValue('CANCELLED')
  cancelled('CANCELLED'),
  @JsonValue('FAILED')
  failed('FAILED');

  final String? value;

  const ApiV1OrdersGetStatus(this.value);
}

enum ApiV1CashControlDepositsGetStatus {
  @JsonValue(null)
  swaggerGeneratedUnknown(null),

  @JsonValue('PENDING')
  pending('PENDING'),
  @JsonValue('APPROVED')
  approved('APPROVED'),
  @JsonValue('VARIANCE')
  variance('VARIANCE'),
  @JsonValue('APPROVED_WITH_VARIANCE')
  approvedWithVariance('APPROVED_WITH_VARIANCE'),
  @JsonValue('REJECTED')
  rejected('REJECTED');

  final String? value;

  const ApiV1CashControlDepositsGetStatus(this.value);
}

enum ApiV1CashControlDepositsVerificationQueueGetStatus {
  @JsonValue(null)
  swaggerGeneratedUnknown(null),

  @JsonValue('PENDING')
  pending('PENDING'),
  @JsonValue('APPROVED')
  approved('APPROVED'),
  @JsonValue('VARIANCE')
  variance('VARIANCE'),
  @JsonValue('APPROVED_WITH_VARIANCE')
  approvedWithVariance('APPROVED_WITH_VARIANCE'),
  @JsonValue('REJECTED')
  rejected('REJECTED');

  final String? value;

  const ApiV1CashControlDepositsVerificationQueueGetStatus(this.value);
}

enum ApiV1CashControlDepositsVarianceCasesGetStatus {
  @JsonValue(null)
  swaggerGeneratedUnknown(null),

  @JsonValue('OPEN')
  open('OPEN'),
  @JsonValue('RESOLVED_APPROVED')
  resolvedApproved('RESOLVED_APPROVED'),
  @JsonValue('RESOLVED_REJECTED')
  resolvedRejected('RESOLVED_REJECTED');

  final String? value;

  const ApiV1CashControlDepositsVarianceCasesGetStatus(this.value);
}
