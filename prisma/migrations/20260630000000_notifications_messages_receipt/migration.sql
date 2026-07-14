-- New CommitmentStatus value (inserted before 'withdrawn')
ALTER TYPE "CommitmentStatus" ADD VALUE 'payment_submitted' BEFORE 'withdrawn';

-- Payment receipt fields on Commitment
ALTER TABLE "Commitment" ADD COLUMN "paymentReceiptUrl"  TEXT;
ALTER TABLE "Commitment" ADD COLUMN "paymentSubmittedAt" TIMESTAMP(3);

-- Notification table
CREATE TABLE "Notification" (
    "id"        TEXT         NOT NULL,
    "profileId" TEXT,
    "adminOnly" BOOLEAN      NOT NULL DEFAULT false,
    "type"      TEXT         NOT NULL,
    "title"     TEXT         NOT NULL,
    "body"      TEXT         NOT NULL,
    "link"      TEXT,
    "read"      BOOLEAN      NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notification_profileId_idx" ON "Notification"("profileId");
CREATE INDEX "Notification_read_idx"      ON "Notification"("read");
ALTER TABLE "Notification"
    ADD CONSTRAINT "Notification_profileId_fkey"
    FOREIGN KEY ("profileId") REFERENCES "Profile"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- PropertyMessage table
CREATE TABLE "PropertyMessage" (
    "id"         TEXT         NOT NULL,
    "propertyId" TEXT         NOT NULL,
    "profileId"  TEXT         NOT NULL,
    "body"       TEXT         NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PropertyMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PropertyMessage_propertyId_idx" ON "PropertyMessage"("propertyId");
CREATE INDEX "PropertyMessage_profileId_idx"  ON "PropertyMessage"("profileId");
ALTER TABLE "PropertyMessage"
    ADD CONSTRAINT "PropertyMessage_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PropertyMessage"
    ADD CONSTRAINT "PropertyMessage_profileId_fkey"
    FOREIGN KEY ("profileId") REFERENCES "Profile"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
