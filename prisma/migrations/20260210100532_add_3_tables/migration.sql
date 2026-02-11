/*
  Warnings:

  - You are about to drop the `Rate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Rate";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "air_rate" (
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "sea_fcl_rate" (
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "sea_lcl_rate" (
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
