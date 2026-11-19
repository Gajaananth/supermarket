import { z } from "zod";

// -----------------------------------------------------------------------------
// ENUMS
// -----------------------------------------------------------------------------

export const RoleSchema = z.enum(["SUPER_ADMIN", "STORE_ADMIN", "RIDER", "CUSTOMER"]);
export type Role = z.infer<typeof RoleSchema>;

export const RiderTypeSchema = z.enum(["EMPLOYEE", "FREELANCE"]);
export type RiderType = z.infer<typeof RiderTypeSchema>;

export const KycStatusSchema = z.enum(["REGISTERED", "KYC_SUBMITTED", "APPROVED", "REJECTED", "SUSPENDED"]);
export type KycStatus = z.infer<typeof KycStatusSchema>;

export const TransferStatusSchema = z.enum([
  "DRAFT",
  "DISPATCHED",
  "RECEIVED_FULL",
  "RECEIVED_PARTIAL",
  "RESOLVED",
  "CANCELLED",
]);
export type TransferStatus = z.infer<typeof TransferStatusSchema>;

export const OrderStatusSchema = z.enum([
  "PLACED",
  "ACCEPTED",
  "REJECTED",
  "PREPARING",
  "READY",
  "RIDER_ASSIGNED",
  "PICKED_UP",
  "ON_THE_WAY",
  "DELIVERED",
  "CANCELLED",
  "FAILED",
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const DepositStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export type DepositStatus = z.infer<typeof DepositStatusSchema>;

// -----------------------------------------------------------------------------
// AUTH DTOs
// -----------------------------------------------------------------------------

export const RequestOtpSchema = z.object({
  destination: z.string().min(8, "Phone or email required"),
  purpose: z.enum(["LOGIN", "REGISTRATION", "PASSWORD_RESET"]).default("LOGIN"),
});
export type RequestOtpDto = z.infer<typeof RequestOtpSchema>;

export const VerifyOtpSchema = z.object({
  destination: z.string().min(8),
  code: z.string().length(6, "OTP must be 6 digits"),
  deviceId: z.string().min(1, "Device ID required"),
  deviceInfo: z.string().optional(),
});
export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>;

export const PasswordLoginSchema = z.object({
  emailOrPhone: z.string().min(3),
  password: z.string().min(6),
  deviceId: z.string().min(1),
  deviceInfo: z.string().optional(),
});
export type PasswordLoginDto = z.infer<typeof PasswordLoginSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
  deviceId: z.string().min(1),
});
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
    role: RoleSchema,
    fullName: z.string(),
    storeId: z.string().nullable().optional(),
  }),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// -----------------------------------------------------------------------------
// MASTER CATALOG & INVENTORY DTOs
// -----------------------------------------------------------------------------

export const CreateMasterProductSchema = z.object({
  barcode: z.string().min(3, "Barcode required"),
  sku: z.string().min(3, "SKU required"),
  name: z.string().min(2, "Product name required"),
  nameTa: z.string().optional(),
  categoryId: z.string().uuid(),
  unit: z.string().min(1),
  costPrice: z.number().positive(),
  baseSellingPrice: z.number().positive(),
  imageUrl: z.string().url().optional(),
  initialWarehouseQuantity: z.number().int().nonnegative().default(0),
});
export type CreateMasterProductDto = z.infer<typeof CreateMasterProductSchema>;

// -----------------------------------------------------------------------------
// STOCK TRANSFER DTOs
// -----------------------------------------------------------------------------

export const CreateTransferItemSchema = z.object({
  masterProductId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const CreateStockTransferSchema = z.object({
  fromWarehouseId: z.string().uuid(),
  toStoreId: z.string().uuid(),
  items: z.array(CreateTransferItemSchema).min(1, "At least one item required"),
  notes: z.string().optional(),
});
export type CreateStockTransferDto = z.infer<typeof CreateStockTransferSchema>;

export const ConfirmTransferReceiptSchema = z.object({
  receivedItems: z.array(
    z.object({
      masterProductId: z.string().uuid(),
      receivedQuantity: z.number().int().nonnegative(),
      notes: z.string().optional(),
    })
  ).min(1),
});
export type ConfirmTransferReceiptDto = z.infer<typeof ConfirmTransferReceiptSchema>;

export const ResolveDiscrepancySchema = z.object({
  resolutionAction: z.enum(["WRITE_OFF", "REVERT_TO_WAREHOUSE"]),
  resolutionNote: z.string().min(5, "Reason for write-off or return required"),
});
export type ResolveDiscrepancyDto = z.infer<typeof ResolveDiscrepancySchema>;

// -----------------------------------------------------------------------------
// RIDER & CASH CONTROL DTOs
// -----------------------------------------------------------------------------

export const SubmitKycSchema = z.object({
  riderType: RiderTypeSchema.default("EMPLOYEE"),
  bikeNumber: z.string().min(4, "Bike registration number required"),
  bikeModel: z.string().min(2),
  drivingLicenceNumber: z.string().min(5),
  drivingLicencePhotoUrl: z.string().min(1),
  revenueLicencePhotoUrl: z.string().min(1),
});
export type SubmitKycDto = z.infer<typeof SubmitKycSchema>;

export const ApproveKycSchema = z.object({
  assignedStoreId: z.string().uuid("Store assignment is mandatory upon approval"),
});
export type ApproveKycDto = z.infer<typeof ApproveKycSchema>;

export const RejectKycSchema = z.object({
  rejectionReason: z.string().min(5, "Rejection explanation required"),
});
export type RejectKycDto = z.infer<typeof RejectKycSchema>;

export const DepositUploadUrlSchema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "application/pdf"]),
  contentLength: z.number().int().min(1).max(5 * 1024 * 1024),
});
export type DepositUploadUrlDto = z.infer<typeof DepositUploadUrlSchema>;

export const SubmitDepositSlipSchema = z.object({
  amount: z.number().positive().max(99999999.99),
  bankRefNumber: z.string().trim().min(4, "Bank transaction reference required").max(100),
  objectKey: z.string().min(1).max(500),
});
export type SubmitDepositSlipDto = z.infer<typeof SubmitDepositSlipSchema>;

export const VerifyDepositSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  rejectionReason: z.string().trim().min(3).max(500).optional(),
}).superRefine((deposit, context) => {
  if (deposit.action === "REJECT" && !deposit.rejectionReason) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["rejectionReason"],
      message: "A rejection reason is required",
    });
  }
});
export type VerifyDepositDto = z.infer<typeof VerifyDepositSchema>;

// -----------------------------------------------------------------------------
// ORDER DTOs
// -----------------------------------------------------------------------------

export const CreateOrderItemSchema = z.object({
  storeProductId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const CreateOrderSchema = z.object({
  storeId: z.string().uuid(),
  deliveryAddressId: z.string().uuid(),
  items: z.array(CreateOrderItemSchema).min(1, "Basket cannot be empty"),
  deliveryZoneId: z.string().uuid().optional(),
});
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;

export const AssignRiderSchema = z.object({
  riderId: z.string().uuid("Eligible rider ID required"),
});
export type AssignRiderDto = z.infer<typeof AssignRiderSchema>;
