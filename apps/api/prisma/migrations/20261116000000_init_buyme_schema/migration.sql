-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'STORE_ADMIN', 'RIDER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "RiderType" AS ENUM ('EMPLOYEE', 'FREELANCE');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('REGISTERED', 'KYC_SUBMITTED', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('DRAFT', 'DISPATCHED', 'RECEIVED_FULL', 'RECEIVED_PARTIAL', 'RESOLVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransferItemStatus" AS ENUM ('PENDING', 'MATCHED', 'DISCREPANT', 'RESOLVED_WRITE_OFF', 'RESOLVED_REVERTED');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('MASTER_ENTRY', 'TRANSFER_DISPATCH', 'TRANSFER_RECEIPT', 'TRANSFER_REVERT', 'TRANSFER_DISCREPANCY_WRITE_OFF', 'ORDER_RESERVATION', 'ORDER_FULFILLMENT', 'ORDER_CANCEL_RESTOCK', 'MANUAL_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('WAREHOUSE', 'STORE', 'IN_TRANSIT', 'CUSTOMER', 'SUPPLIER', 'WRITE_OFF');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PLACED', 'ACCEPTED', 'REJECTED', 'PREPARING', 'READY', 'RIDER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COLLECTED_BY_RIDER', 'DEPOSITED_TO_STORE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('PUSH', 'SMS', 'EMAIL', 'IN_APP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('LOGIN', 'REGISTRATION', 'PHONE_VERIFICATION', 'PASSWORD_RESET', 'ADMIN_2FA');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "passwordHash" VARCHAR(255),
    "role" "Role" NOT NULL,
    "fullName" VARCHAR(150) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "refreshTokenHash" VARCHAR(255) NOT NULL,
    "deviceId" VARCHAR(100) NOT NULL,
    "deviceInfo" VARCHAR(255),
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpRequest" (
    "id" UUID NOT NULL,
    "destination" VARCHAR(100) NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "codeHash" VARCHAR(255) NOT NULL,
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "contactPhone" VARCHAR(20) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "address" TEXT NOT NULL,
    "locality" VARCHAR(100) NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "contactPhone" VARCHAR(20) NOT NULL,
    "contactEmail" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "openingTime" VARCHAR(5) NOT NULL DEFAULT '07:00',
    "closingTime" VARCHAR(5) NOT NULL DEFAULT '22:00',
    "serviceRadiusKm" DECIMAL(5,2) NOT NULL DEFAULT 10.0,
    "serviceAreaPolygon" JSONB,
    "allowPriceOverride" BOOLEAN NOT NULL DEFAULT false,
    "minOrderAmount" DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    "freeDeliveryThreshold" DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
    "cashHoldThreshold" DECIMAL(10,2) NOT NULL DEFAULT 10000.00,
    "cashHoldMaxHours" INTEGER NOT NULL DEFAULT 4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreAdmin" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryZone" (
    "id" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "zoneNumber" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "polygonCoordinates" JSONB,
    "radiusKm" DECIMAL(5,2),
    "baseFee" DECIMAL(10,2) NOT NULL,
    "minOrderForFreeDelivery" DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
    "estimatedDeliveryMins" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "nameTa" VARCHAR(100),
    "slug" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(50),
    "imageUrl" VARCHAR(500),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterProduct" (
    "id" UUID NOT NULL,
    "barcode" VARCHAR(100) NOT NULL,
    "sku" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "nameTa" VARCHAR(200),
    "description" TEXT,
    "categoryId" UUID NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "costPrice" DECIMAL(10,2) NOT NULL,
    "baseSellingPrice" DECIMAL(10,2) NOT NULL,
    "imageUrl" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterInventory" (
    "id" UUID NOT NULL,
    "warehouseId" UUID NOT NULL,
    "masterProductId" UUID NOT NULL,
    "quantityOnHand" INTEGER NOT NULL DEFAULT 0,
    "quantityReserved" INTEGER NOT NULL DEFAULT 0,
    "reorderLevel" INTEGER NOT NULL DEFAULT 50,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreProduct" (
    "id" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "masterProductId" UUID NOT NULL,
    "customPrice" DECIMAL(10,2),
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "quantityOnHand" INTEGER NOT NULL DEFAULT 0,
    "quantityReserved" INTEGER NOT NULL DEFAULT 0,
    "reorderLevel" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" UUID NOT NULL,
    "movementType" "StockMovementType" NOT NULL,
    "referenceId" VARCHAR(100),
    "fromLocationType" "LocationType" NOT NULL,
    "fromLocationId" VARCHAR(100),
    "toLocationType" "LocationType" NOT NULL,
    "toLocationId" VARCHAR(100),
    "masterProductId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(10,2),
    "reason" TEXT,
    "createdByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockTransfer" (
    "id" UUID NOT NULL,
    "transferNumber" VARCHAR(50) NOT NULL,
    "fromWarehouseId" UUID NOT NULL,
    "toStoreId" UUID NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'DRAFT',
    "dispatchedByUserId" UUID,
    "dispatchedAt" TIMESTAMP(3),
    "receivedByUserId" UUID,
    "receivedAt" TIMESTAMP(3),
    "resolvedByUserId" UUID,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockTransferItem" (
    "id" UUID NOT NULL,
    "transferId" UUID NOT NULL,
    "masterProductId" UUID NOT NULL,
    "requestedQuantity" INTEGER NOT NULL,
    "dispatchedQuantity" INTEGER NOT NULL DEFAULT 0,
    "receivedQuantity" INTEGER,
    "discrepancyQuantity" INTEGER DEFAULT 0,
    "itemStatus" "TransferItemStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,

    CONSTRAINT "StockTransferItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiderProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "riderType" "RiderType" NOT NULL DEFAULT 'EMPLOYEE',
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'REGISTERED',
    "assignedStoreId" UUID,
    "bikeNumber" VARCHAR(50),
    "bikeModel" VARCHAR(100),
    "drivingLicenceNumber" VARCHAR(50),
    "drivingLicencePhotoUrl" VARCHAR(500),
    "revenueLicencePhotoUrl" VARCHAR(500),
    "rejectionReason" TEXT,
    "approvedByUserId" UUID,
    "approvedAt" TIMESTAMP(3),
    "isShiftActive" BOOLEAN NOT NULL DEFAULT false,
    "currentLocationLat" DECIMAL(10,7),
    "currentLocationLng" DECIMAL(10,7),
    "lastLocationUpdate" TIMESTAMP(3),
    "cashInHand" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "oldestCashCollectionTime" TIMESTAMP(3),
    "isCashLocked" BOOLEAN NOT NULL DEFAULT false,
    "cashLockReason" TEXT,
    "depositPending" BOOLEAN NOT NULL DEFAULT false,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    "totalCompletedDeliveries" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiderDeposit" (
    "id" UUID NOT NULL,
    "depositNumber" VARCHAR(50) NOT NULL,
    "riderId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "bankRefNumber" VARCHAR(100) NOT NULL,
    "slipImageUrl" VARCHAR(500) NOT NULL,
    "status" "DepositStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedByUserId" UUID,
    "verifiedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "notes" TEXT,

    CONSTRAINT "RiderDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiderLocationHistory" (
    "id" UUID NOT NULL,
    "riderId" UUID NOT NULL,
    "orderId" UUID,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "heading" DECIMAL(5,2),
    "speedKmh" DECIMAL(5,2),
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiderLocationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "label" VARCHAR(50) NOT NULL DEFAULT 'Home',
    "recipientName" VARCHAR(100) NOT NULL,
    "recipientPhone" VARCHAR(20) NOT NULL,
    "streetAddress" TEXT NOT NULL,
    "landmark" VARCHAR(150),
    "locality" VARCHAR(100) NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "orderNumber" VARCHAR(50) NOT NULL,
    "customerId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "deliveryAddressId" UUID,
    "deliveryAddressSnapshot" JSONB NOT NULL,
    "deliveryZoneId" UUID,
    "status" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'COD',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "riderId" UUID,
    "storeAcceptTimeoutAt" TIMESTAMP(3),
    "assignedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "storeProductId" UUID NOT NULL,
    "productName" VARCHAR(200) NOT NULL,
    "productUnit" VARCHAR(20) NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderTimeline" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "actorRole" "Role" NOT NULL,
    "actorId" UUID,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "recipientUserId" UUID NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "failureReason" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreAlert" (
    "id" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "orderId" UUID,
    "alertType" VARCHAR(50) NOT NULL,
    "isAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "userRole" "Role",
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" VARCHAR(100) NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitRecord" (
    "id" UUID NOT NULL,
    "key" VARCHAR(150) NOT NULL,
    "endpoint" VARCHAR(100) NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 1,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockedUntil" TIMESTAMP(3),

    CONSTRAINT "RateLimitRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceSession_refreshTokenHash_key" ON "DeviceSession"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "DeviceSession_userId_isRevoked_idx" ON "DeviceSession"("userId", "isRevoked");

-- CreateIndex
CREATE INDEX "DeviceSession_refreshTokenHash_idx" ON "DeviceSession"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "OtpRequest_destination_purpose_isUsed_idx" ON "OtpRequest"("destination", "purpose", "isUsed");

-- CreateIndex
CREATE INDEX "OtpRequest_expiresAt_idx" ON "OtpRequest"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_code_key" ON "Warehouse"("code");

-- CreateIndex
CREATE INDEX "Warehouse_latitude_longitude_idx" ON "Warehouse"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "Store_code_key" ON "Store"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");

-- CreateIndex
CREATE INDEX "Store_latitude_longitude_idx" ON "Store"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Store_isActive_idx" ON "Store"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "StoreAdmin_userId_key" ON "StoreAdmin"("userId");

-- CreateIndex
CREATE INDEX "StoreAdmin_storeId_idx" ON "StoreAdmin"("storeId");

-- CreateIndex
CREATE INDEX "DeliveryZone_storeId_isActive_idx" ON "DeliveryZone"("storeId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryZone_storeId_zoneNumber_key" ON "DeliveryZone"("storeId", "zoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_isActive_sortOrder_idx" ON "Category"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "MasterProduct_barcode_key" ON "MasterProduct"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "MasterProduct_sku_key" ON "MasterProduct"("sku");

-- CreateIndex
CREATE INDEX "MasterProduct_barcode_idx" ON "MasterProduct"("barcode");

-- CreateIndex
CREATE INDEX "MasterProduct_name_idx" ON "MasterProduct"("name");

-- CreateIndex
CREATE INDEX "MasterProduct_categoryId_isActive_idx" ON "MasterProduct"("categoryId", "isActive");

-- CreateIndex
CREATE INDEX "MasterInventory_warehouseId_idx" ON "MasterInventory"("warehouseId");

-- CreateIndex
CREATE INDEX "MasterInventory_masterProductId_idx" ON "MasterInventory"("masterProductId");

-- CreateIndex
CREATE UNIQUE INDEX "MasterInventory_warehouseId_masterProductId_key" ON "MasterInventory"("warehouseId", "masterProductId");

-- CreateIndex
CREATE INDEX "StoreProduct_storeId_isAvailable_idx" ON "StoreProduct"("storeId", "isAvailable");

-- CreateIndex
CREATE INDEX "StoreProduct_masterProductId_idx" ON "StoreProduct"("masterProductId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreProduct_storeId_masterProductId_key" ON "StoreProduct"("storeId", "masterProductId");

-- CreateIndex
CREATE INDEX "StockMovement_movementType_referenceId_idx" ON "StockMovement"("movementType", "referenceId");

-- CreateIndex
CREATE INDEX "StockMovement_masterProductId_createdAt_idx" ON "StockMovement"("masterProductId", "createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_fromLocationType_fromLocationId_idx" ON "StockMovement"("fromLocationType", "fromLocationId");

-- CreateIndex
CREATE INDEX "StockMovement_toLocationType_toLocationId_idx" ON "StockMovement"("toLocationType", "toLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "StockTransfer_transferNumber_key" ON "StockTransfer"("transferNumber");

-- CreateIndex
CREATE INDEX "StockTransfer_fromWarehouseId_status_idx" ON "StockTransfer"("fromWarehouseId", "status");

-- CreateIndex
CREATE INDEX "StockTransfer_toStoreId_status_idx" ON "StockTransfer"("toStoreId", "status");

-- CreateIndex
CREATE INDEX "StockTransfer_transferNumber_idx" ON "StockTransfer"("transferNumber");

-- CreateIndex
CREATE INDEX "StockTransferItem_transferId_itemStatus_idx" ON "StockTransferItem"("transferId", "itemStatus");

-- CreateIndex
CREATE UNIQUE INDEX "StockTransferItem_transferId_masterProductId_key" ON "StockTransferItem"("transferId", "masterProductId");

-- CreateIndex
CREATE UNIQUE INDEX "RiderProfile_userId_key" ON "RiderProfile"("userId");

-- CreateIndex
CREATE INDEX "RiderProfile_assignedStoreId_isShiftActive_isCashLocked_idx" ON "RiderProfile"("assignedStoreId", "isShiftActive", "isCashLocked");

-- CreateIndex
CREATE INDEX "RiderProfile_kycStatus_idx" ON "RiderProfile"("kycStatus");

-- CreateIndex
CREATE INDEX "RiderProfile_currentLocationLat_currentLocationLng_idx" ON "RiderProfile"("currentLocationLat", "currentLocationLng");

-- CreateIndex
CREATE UNIQUE INDEX "RiderDeposit_depositNumber_key" ON "RiderDeposit"("depositNumber");

-- CreateIndex
CREATE INDEX "RiderDeposit_riderId_status_idx" ON "RiderDeposit"("riderId", "status");

-- CreateIndex
CREATE INDEX "RiderDeposit_storeId_status_idx" ON "RiderDeposit"("storeId", "status");

-- CreateIndex
CREATE INDEX "RiderDeposit_depositNumber_idx" ON "RiderDeposit"("depositNumber");

-- CreateIndex
CREATE INDEX "RiderLocationHistory_riderId_recordedAt_idx" ON "RiderLocationHistory"("riderId", "recordedAt");

-- CreateIndex
CREATE INDEX "RiderLocationHistory_orderId_recordedAt_idx" ON "RiderLocationHistory"("orderId", "recordedAt");

-- CreateIndex
CREATE INDEX "RiderLocationHistory_latitude_longitude_idx" ON "RiderLocationHistory"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_userId_key" ON "CustomerProfile"("userId");

-- CreateIndex
CREATE INDEX "CustomerProfile_userId_idx" ON "CustomerProfile"("userId");

-- CreateIndex
CREATE INDEX "Address_customerId_isDefault_idx" ON "Address"("customerId", "isDefault");

-- CreateIndex
CREATE INDEX "Address_latitude_longitude_idx" ON "Address"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_storeId_status_idx" ON "Order"("storeId", "status");

-- CreateIndex
CREATE INDEX "Order_customerId_status_idx" ON "Order"("customerId", "status");

-- CreateIndex
CREATE INDEX "Order_riderId_status_idx" ON "Order"("riderId", "status");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_storeProductId_idx" ON "OrderItem"("storeProductId");

-- CreateIndex
CREATE INDEX "OrderTimeline_orderId_createdAt_idx" ON "OrderTimeline"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_recipientUserId_status_idx" ON "Notification"("recipientUserId", "status");

-- CreateIndex
CREATE INDEX "Notification_channel_status_idx" ON "Notification"("channel", "status");

-- CreateIndex
CREATE INDEX "StoreAlert_storeId_isAcknowledged_idx" ON "StoreAlert"("storeId", "isAcknowledged");

-- CreateIndex
CREATE INDEX "StoreAlert_orderId_idx" ON "StoreAlert"("orderId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "RateLimitRecord_key_endpoint_idx" ON "RateLimitRecord"("key", "endpoint");

-- CreateIndex
CREATE INDEX "RateLimitRecord_blockedUntil_idx" ON "RateLimitRecord"("blockedUntil");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimitRecord_key_endpoint_key" ON "RateLimitRecord"("key", "endpoint");

-- AddForeignKey
ALTER TABLE "DeviceSession" ADD CONSTRAINT "DeviceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreAdmin" ADD CONSTRAINT "StoreAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreAdmin" ADD CONSTRAINT "StoreAdmin_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryZone" ADD CONSTRAINT "DeliveryZone_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterProduct" ADD CONSTRAINT "MasterProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterInventory" ADD CONSTRAINT "MasterInventory_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterInventory" ADD CONSTRAINT "MasterInventory_masterProductId_fkey" FOREIGN KEY ("masterProductId") REFERENCES "MasterProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreProduct" ADD CONSTRAINT "StoreProduct_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreProduct" ADD CONSTRAINT "StoreProduct_masterProductId_fkey" FOREIGN KEY ("masterProductId") REFERENCES "MasterProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_masterProductId_fkey" FOREIGN KEY ("masterProductId") REFERENCES "MasterProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_toStoreId_fkey" FOREIGN KEY ("toStoreId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_dispatchedByUserId_fkey" FOREIGN KEY ("dispatchedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_receivedByUserId_fkey" FOREIGN KEY ("receivedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransferItem" ADD CONSTRAINT "StockTransferItem_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "StockTransfer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransferItem" ADD CONSTRAINT "StockTransferItem_masterProductId_fkey" FOREIGN KEY ("masterProductId") REFERENCES "MasterProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderProfile" ADD CONSTRAINT "RiderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderProfile" ADD CONSTRAINT "RiderProfile_assignedStoreId_fkey" FOREIGN KEY ("assignedStoreId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderProfile" ADD CONSTRAINT "RiderProfile_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderDeposit" ADD CONSTRAINT "RiderDeposit_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "RiderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderDeposit" ADD CONSTRAINT "RiderDeposit_verifiedByUserId_fkey" FOREIGN KEY ("verifiedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderLocationHistory" ADD CONSTRAINT "RiderLocationHistory_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "RiderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryZoneId_fkey" FOREIGN KEY ("deliveryZoneId") REFERENCES "DeliveryZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "RiderProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_storeProductId_fkey" FOREIGN KEY ("storeProductId") REFERENCES "StoreProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTimeline" ADD CONSTRAINT "OrderTimeline_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreAlert" ADD CONSTRAINT "StoreAlert_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreAlert" ADD CONSTRAINT "StoreAlert_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
