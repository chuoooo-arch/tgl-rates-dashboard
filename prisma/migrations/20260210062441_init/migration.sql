-- CreateTable
CREATE TABLE "Rate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mode" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "rate20gp" REAL,
    "rate40gp" REAL,
    "rate40hc" REAL,
    "carrier" TEXT,
    "currency" TEXT,
    "validFrom" DATETIME,
    "validTo" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
