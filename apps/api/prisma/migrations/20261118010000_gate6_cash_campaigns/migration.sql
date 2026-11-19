ALTER TYPE "DepositStatus" ADD VALUE 'VARIANCE';
ALTER TYPE "DepositStatus" ADD VALUE 'APPROVED_WITH_VARIANCE';

CREATE TYPE "DepositVarianceStatus" AS ENUM (
    'OPEN',
    'RESOLVED_APPROVED',
    'RESOLVED_REJECTED'
);

CREATE TYPE "CampaignType" AS ENUM (
    'FREE_DELIVERY',
    'FIXED_DISCOUNT',
    'PERCENTAGE_DISCOUNT'
);

CREATE TYPE "RiderCashEntryType" AS ENUM (
    'OPENING_BALANCE',
    'DELIVERY_COLLECTION',
    'DEPOSIT_SETTLEMENT',
    'VARIANCE_ADJUSTMENT'
);

ALTER TABLE "RiderDeposit"
    ADD COLUMN "receivedAmount" DECIMAL(10,2),
    ADD COLUMN "varianceAmount" DECIMAL(10,2),
    ADD COLUMN "varianceReason" TEXT;

CREATE TABLE "RiderCashLedgerEntry" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "riderId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "entryType" "RiderCashEntryType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "balanceAfter" DECIMAL(10,2) NOT NULL,
    "orderId" UUID,
    "depositId" UUID,
    "actorUserId" UUID,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RiderCashLedgerEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RiderDepositVarianceCase" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "depositId" UUID NOT NULL,
    "riderId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "expectedAmount" DECIMAL(10,2) NOT NULL,
    "receivedAmount" DECIMAL(10,2) NOT NULL,
    "varianceAmount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "DepositVarianceStatus" NOT NULL DEFAULT 'OPEN',
    "openedByUserId" UUID NOT NULL,
    "resolvedByUserId" UUID,
    "resolutionNote" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    CONSTRAINT "RiderDepositVarianceCase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Campaign" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(40),
    "storeId" UUID,
    "type" "CampaignType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "minSubtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "maxDiscount" DECIMAL(10,2),
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Campaign_value_check" CHECK ("value" >= 0),
    CONSTRAINT "Campaign_minSubtotal_check" CHECK ("minSubtotal" >= 0),
    CONSTRAINT "Campaign_maxDiscount_check" CHECK ("maxDiscount" IS NULL OR "maxDiscount" >= 0),
    CONSTRAINT "Campaign_date_range_check" CHECK ("endsAt" > "startsAt"),
    CONSTRAINT "Campaign_percentage_value_check" CHECK ("type" != 'PERCENTAGE_DISCOUNT' OR "value" <= 100)
);

CREATE TABLE "OrderCampaign" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "campaignName" VARCHAR(100) NOT NULL,
    "campaignCode" VARCHAR(40),
    "discountAmount" DECIMAL(10,2) NOT NULL,
    "deliveryFeeWaived" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderCampaign_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RiderCashLedgerEntry_orderId_key"
    ON "RiderCashLedgerEntry"("orderId");
CREATE UNIQUE INDEX "RiderCashLedgerEntry_depositId_entryType_key"
    ON "RiderCashLedgerEntry"("depositId", "entryType");
CREATE INDEX "RiderCashLedgerEntry_storeId_createdAt_idx"
    ON "RiderCashLedgerEntry"("storeId", "createdAt");
CREATE INDEX "RiderCashLedgerEntry_riderId_createdAt_idx"
    ON "RiderCashLedgerEntry"("riderId", "createdAt");
CREATE INDEX "RiderCashLedgerEntry_entryType_createdAt_idx"
    ON "RiderCashLedgerEntry"("entryType", "createdAt");
CREATE UNIQUE INDEX "RiderDepositVarianceCase_depositId_key"
    ON "RiderDepositVarianceCase"("depositId");
CREATE INDEX "RiderDepositVarianceCase_storeId_status_openedAt_idx"
    ON "RiderDepositVarianceCase"("storeId", "status", "openedAt");
CREATE INDEX "RiderDepositVarianceCase_riderId_status_idx"
    ON "RiderDepositVarianceCase"("riderId", "status");
CREATE UNIQUE INDEX "Campaign_code_key"
    ON "Campaign"("code");
CREATE INDEX "Campaign_storeId_isActive_startsAt_endsAt_idx"
    ON "Campaign"("storeId", "isActive", "startsAt", "endsAt");
CREATE UNIQUE INDEX "OrderCampaign_orderId_campaignId_key"
    ON "OrderCampaign"("orderId", "campaignId");
CREATE INDEX "OrderCampaign_campaignId_createdAt_idx"
    ON "OrderCampaign"("campaignId", "createdAt");

ALTER TABLE "RiderCashLedgerEntry"
    ADD CONSTRAINT "RiderCashLedgerEntry_riderId_fkey"
        FOREIGN KEY ("riderId") REFERENCES "RiderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "RiderCashLedgerEntry_storeId_fkey"
        FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "RiderCashLedgerEntry_orderId_fkey"
        FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "RiderCashLedgerEntry_depositId_fkey"
        FOREIGN KEY ("depositId") REFERENCES "RiderDeposit"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "RiderCashLedgerEntry_actorUserId_fkey"
        FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RiderDepositVarianceCase"
    ADD CONSTRAINT "RiderDepositVarianceCase_depositId_fkey"
        FOREIGN KEY ("depositId") REFERENCES "RiderDeposit"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "RiderDepositVarianceCase_riderId_fkey"
        FOREIGN KEY ("riderId") REFERENCES "RiderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "RiderDepositVarianceCase_storeId_fkey"
        FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "RiderDepositVarianceCase_openedByUserId_fkey"
        FOREIGN KEY ("openedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "RiderDepositVarianceCase_resolvedByUserId_fkey"
        FOREIGN KEY ("resolvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Campaign"
    ADD CONSTRAINT "Campaign_storeId_fkey"
        FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrderCampaign"
    ADD CONSTRAINT "OrderCampaign_orderId_fkey"
        FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "OrderCampaign_campaignId_fkey"
        FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "RiderCashLedgerEntry" (
    "riderId",
    "storeId",
    "entryType",
    "amount",
    "balanceAfter",
    "note",
    "createdAt"
)
SELECT
    "id",
    "assignedStoreId",
    'OPENING_BALANCE',
    "cashInHand",
    "cashInHand",
    'Opening balance when rider cash ledger was enabled',
    CURRENT_TIMESTAMP
FROM "RiderProfile"
WHERE "assignedStoreId" IS NOT NULL AND "cashInHand" > 0;
