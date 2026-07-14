-- Add subscriberNotifiedAt to Property
ALTER TABLE "Property" ADD COLUMN "subscriberNotifiedAt" TIMESTAMP(3);

-- Add subscriberNotifiedAt to Deal
ALTER TABLE "Deal" ADD COLUMN "subscriberNotifiedAt" TIMESTAMP(3);

-- CreateTable Subscriber
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "subscribeListings" BOOLEAN NOT NULL DEFAULT true,
    "subscribeDeals" BOOLEAN NOT NULL DEFAULT true,
    "unsubscribeToken" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");
CREATE UNIQUE INDEX "Subscriber_unsubscribeToken_key" ON "Subscriber"("unsubscribeToken");
