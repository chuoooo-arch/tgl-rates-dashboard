/*
  Warnings:

  - Added the required column `fingerprint` to the `air_rate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fingerprint` to the `sea_fcl_rate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fingerprint` to the `sea_lcl_rate` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_air_rate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mode" TEXT NOT NULL DEFAULT 'AIR',
    "origin_port_code" TEXT NOT NULL,
    "destination_port_code" TEXT NOT NULL,
    "min" REAL,
    "rate_45" REAL,
    "rate_100" REAL,
    "rate_300" REAL,
    "rate_500" REAL,
    "rate_1000" REAL,
    "surcharge_1000" REAL,
    "carrier" TEXT,
    "currency" TEXT,
    "valid_from" DATETIME,
    "valid_to" DATETIME,
    "etd" TEXT,
    "agency" TEXT,
    "fingerprint" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_air_rate" ("agency", "carrier", "created_at", "currency", "destination_port_code", "etd", "id", "min", "mode", "origin_port_code", "rate_100", "rate_1000", "rate_300", "rate_45", "rate_500", "surcharge_1000", "valid_from", "valid_to") SELECT "agency", "carrier", "created_at", "currency", "destination_port_code", "etd", "id", "min", "mode", "origin_port_code", "rate_100", "rate_1000", "rate_300", "rate_45", "rate_500", "surcharge_1000", "valid_from", "valid_to" FROM "air_rate";
DROP TABLE "air_rate";
ALTER TABLE "new_air_rate" RENAME TO "air_rate";
CREATE UNIQUE INDEX "air_rate_fingerprint_key" ON "air_rate"("fingerprint");
CREATE TABLE "new_sea_fcl_rate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mode" TEXT NOT NULL DEFAULT 'SEA_FCL',
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "rate_20gp" REAL,
    "rate_40gp" REAL,
    "rate_40hc" REAL,
    "rate_20_rf" REAL,
    "rate_40_rf" REAL,
    "carrier" TEXT,
    "currency" TEXT,
    "valid_from" DATETIME,
    "valid_to" DATETIME,
    "transit_time" TEXT,
    "etd" TEXT,
    "agency" TEXT,
    "fingerprint" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_sea_fcl_rate" ("agency", "carrier", "created_at", "currency", "destination", "etd", "id", "mode", "origin", "rate_20_rf", "rate_20gp", "rate_40_rf", "rate_40gp", "rate_40hc", "transit_time", "valid_from", "valid_to") SELECT "agency", "carrier", "created_at", "currency", "destination", "etd", "id", "mode", "origin", "rate_20_rf", "rate_20gp", "rate_40_rf", "rate_40gp", "rate_40hc", "transit_time", "valid_from", "valid_to" FROM "sea_fcl_rate";
DROP TABLE "sea_fcl_rate";
ALTER TABLE "new_sea_fcl_rate" RENAME TO "sea_fcl_rate";
CREATE UNIQUE INDEX "sea_fcl_rate_fingerprint_key" ON "sea_fcl_rate"("fingerprint");
CREATE TABLE "new_sea_lcl_rate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mode" TEXT NOT NULL DEFAULT 'SEA_LCL',
    "origin_port_code" TEXT NOT NULL,
    "destination_port_code" TEXT NOT NULL,
    "w_m" REAL,
    "min_charge" REAL,
    "refund_freight" REAL,
    "carrier" TEXT,
    "currency" TEXT,
    "valid_from" DATETIME,
    "valid_to" DATETIME,
    "transit_time" TEXT,
    "agency" TEXT,
    "fingerprint" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_sea_lcl_rate" ("agency", "carrier", "created_at", "currency", "destination_port_code", "id", "min_charge", "mode", "origin_port_code", "refund_freight", "transit_time", "valid_from", "valid_to", "w_m") SELECT "agency", "carrier", "created_at", "currency", "destination_port_code", "id", "min_charge", "mode", "origin_port_code", "refund_freight", "transit_time", "valid_from", "valid_to", "w_m" FROM "sea_lcl_rate";
DROP TABLE "sea_lcl_rate";
ALTER TABLE "new_sea_lcl_rate" RENAME TO "sea_lcl_rate";
CREATE UNIQUE INDEX "sea_lcl_rate_fingerprint_key" ON "sea_lcl_rate"("fingerprint");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
