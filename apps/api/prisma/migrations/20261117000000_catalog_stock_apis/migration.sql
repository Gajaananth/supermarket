CREATE TABLE "MasterProductBarcode" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "masterProductId" UUID NOT NULL,
    "barcode" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasterProductBarcode_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "StoreAlert"
    ADD COLUMN "masterProductId" UUID,
    ADD COLUMN "details" JSONB;

CREATE UNIQUE INDEX "MasterProductBarcode_barcode_key"
    ON "MasterProductBarcode"("barcode");
CREATE INDEX "MasterProductBarcode_masterProductId_idx"
    ON "MasterProductBarcode"("masterProductId");
CREATE UNIQUE INDEX "StoreAlert_storeId_masterProductId_alertType_isAcknowledged_key"
    ON "StoreAlert"("storeId", "masterProductId", "alertType", "isAcknowledged");

ALTER TABLE "MasterProductBarcode"
    ADD CONSTRAINT "MasterProductBarcode_masterProductId_fkey"
    FOREIGN KEY ("masterProductId") REFERENCES "MasterProduct"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoreAlert"
    ADD CONSTRAINT "StoreAlert_masterProductId_fkey"
    FOREIGN KEY ("masterProductId") REFERENCES "MasterProduct"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MasterProduct"
    ADD CONSTRAINT "MasterProduct_barcode_length_check"
        CHECK (char_length("barcode") BETWEEN 3 AND 100);
ALTER TABLE "MasterInventory"
    ADD CONSTRAINT "MasterInventory_nonnegative_stock_check"
        CHECK ("quantityOnHand" >= 0 AND "quantityReserved" >= 0),
    ADD CONSTRAINT "MasterInventory_reserved_within_stock_check"
        CHECK ("quantityReserved" <= "quantityOnHand");
ALTER TABLE "StoreProduct"
    ADD CONSTRAINT "StoreProduct_nonnegative_stock_check"
        CHECK ("quantityOnHand" >= 0 AND "quantityReserved" >= 0),
    ADD CONSTRAINT "StoreProduct_reserved_within_stock_check"
        CHECK ("quantityReserved" <= "quantityOnHand");
ALTER TABLE "StockTransferItem"
    ADD CONSTRAINT "StockTransferItem_quantities_check"
        CHECK (
            "requestedQuantity" > 0
            AND "dispatchedQuantity" >= 0
            AND "dispatchedQuantity" <= "requestedQuantity"
            AND ("receivedQuantity" IS NULL OR
                 ("receivedQuantity" >= 0 AND "receivedQuantity" <= "dispatchedQuantity"))
            AND ("discrepancyQuantity" IS NULL OR "discrepancyQuantity" >= 0)
            AND ("receivedQuantity" IS NULL OR
                 "discrepancyQuantity" = "dispatchedQuantity" - "receivedQuantity")
        );
ALTER TABLE "StockMovement"
    ADD CONSTRAINT "StockMovement_positive_quantity_check" CHECK ("quantity" > 0);

CREATE FUNCTION prevent_stock_movement_mutation() RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'Stock movements are immutable'
        USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER "StockMovement_immutable_trigger"
    BEFORE UPDATE OR DELETE ON "StockMovement"
    FOR EACH ROW EXECUTE FUNCTION prevent_stock_movement_mutation();
