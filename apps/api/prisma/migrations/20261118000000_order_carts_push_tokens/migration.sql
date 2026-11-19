ALTER TYPE "Role" ADD VALUE 'SYSTEM';
ALTER TYPE "NotificationStatus" ADD VALUE 'PROCESSING';

ALTER TABLE "DeviceSession"
ADD COLUMN "pushToken" VARCHAR(512);

CREATE UNIQUE INDEX "DeviceSession_pushToken_key"
ON "DeviceSession"("pushToken");

CREATE TABLE "Cart" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customerId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CartItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cartId" UUID NOT NULL,
    "storeProductId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Cart_customerId_storeId_key"
ON "Cart"("customerId", "storeId");
CREATE INDEX "Cart_storeId_idx" ON "Cart"("storeId");
CREATE UNIQUE INDEX "CartItem_cartId_storeProductId_key"
ON "CartItem"("cartId", "storeProductId");
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");
ALTER TABLE "CartItem"
ADD CONSTRAINT "CartItem_quantity_check" CHECK ("quantity" BETWEEN 1 AND 1000);

ALTER TABLE "Notification"
ADD COLUMN "processingAt" TIMESTAMP(3),
ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "Order_status_storeAcceptTimeoutAt_idx"
ON "Order"("status", "storeAcceptTimeoutAt");

ALTER TABLE "Cart"
ADD CONSTRAINT "Cart_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "CustomerProfile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Cart"
ADD CONSTRAINT "Cart_storeId_fkey"
FOREIGN KEY ("storeId") REFERENCES "Store"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CartItem"
ADD CONSTRAINT "CartItem_cartId_fkey"
FOREIGN KEY ("cartId") REFERENCES "Cart"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CartItem"
ADD CONSTRAINT "CartItem_storeProductId_fkey"
FOREIGN KEY ("storeProductId") REFERENCES "StoreProduct"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
