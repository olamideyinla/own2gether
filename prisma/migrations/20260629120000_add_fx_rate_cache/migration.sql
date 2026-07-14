-- CreateTable
CREATE TABLE "FxRateCache" (
    "id"        INTEGER          NOT NULL,
    "usdPerNgn" DOUBLE PRECISION NOT NULL,
    "gbpPerNgn" DOUBLE PRECISION NOT NULL,
    "fetchedAt" TIMESTAMP(3)     NOT NULL,

    CONSTRAINT "FxRateCache_pkey" PRIMARY KEY ("id")
);
