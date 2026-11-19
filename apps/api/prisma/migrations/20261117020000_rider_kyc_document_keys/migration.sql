ALTER TABLE "RiderProfile"
    ADD COLUMN "drivingLicenceObjectKey" VARCHAR(500),
    ADD COLUMN "vehicleLicenceObjectKey" VARCHAR(500);

CREATE UNIQUE INDEX "RiderProfile_drivingLicenceObjectKey_key"
    ON "RiderProfile"("drivingLicenceObjectKey");
CREATE UNIQUE INDEX "RiderProfile_vehicleLicenceObjectKey_key"
    ON "RiderProfile"("vehicleLicenceObjectKey");
