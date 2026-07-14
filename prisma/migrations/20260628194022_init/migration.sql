-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('unverified', 'pending', 'verified');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('passport', 'drivers_license', 'national_id');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('open', 'fully_allocated', 'closed', 'cancelled');

-- CreateEnum
CREATE TYPE "CommitmentStatus" AS ENUM ('pending', 'allocated', 'partially_allocated', 'capped', 'withdrawn', 'paid');

-- CreateEnum
CREATE TYPE "StakeSource" AS ENUM ('management_fee', 'co_owner', 'residual_buy_in');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'unverified',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityDocument" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "proofOfAddressUrl" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "status" "DocumentStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "IdentityDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "photos" TEXT[],
    "propertyPrice" DECIMAL(15,2) NOT NULL,
    "legalFees" DECIMAL(15,2) NOT NULL,
    "otherCosts" DECIMAL(15,2) NOT NULL,
    "totalRaise" DECIMAL(15,2) NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectionGroup" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdByProfileId" TEXT NOT NULL,

    CONSTRAINT "ConnectionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commitment" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "connectionGroupId" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "status" "CommitmentStatus" NOT NULL DEFAULT 'pending',
    "allocatedAmount" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allocationConfirmedAt" TIMESTAMP(3),
    "paymentDueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Commitment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "commitmentId" TEXT NOT NULL,
    "withdrawnAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stake" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "profileId" TEXT,
    "percentage" DECIMAL(7,4) NOT NULL,
    "source" "StakeSource" NOT NULL,

    CONSTRAINT "Stake_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");

-- CreateIndex
CREATE INDEX "IdentityDocument_profileId_idx" ON "IdentityDocument"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectionGroup_code_key" ON "ConnectionGroup"("code");

-- CreateIndex
CREATE INDEX "ConnectionGroup_propertyId_idx" ON "ConnectionGroup"("propertyId");

-- CreateIndex
CREATE INDEX "Commitment_profileId_idx" ON "Commitment"("profileId");

-- CreateIndex
CREATE INDEX "Commitment_propertyId_idx" ON "Commitment"("propertyId");

-- CreateIndex
CREATE INDEX "Commitment_connectionGroupId_idx" ON "Commitment"("connectionGroupId");

-- CreateIndex
CREATE INDEX "Withdrawal_profileId_idx" ON "Withdrawal"("profileId");

-- CreateIndex
CREATE INDEX "Withdrawal_commitmentId_idx" ON "Withdrawal"("commitmentId");

-- CreateIndex
CREATE INDEX "Stake_propertyId_idx" ON "Stake"("propertyId");

-- CreateIndex
CREATE INDEX "Stake_profileId_idx" ON "Stake"("profileId");

-- AddForeignKey
ALTER TABLE "IdentityDocument" ADD CONSTRAINT "IdentityDocument_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectionGroup" ADD CONSTRAINT "ConnectionGroup_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectionGroup" ADD CONSTRAINT "ConnectionGroup_createdByProfileId_fkey" FOREIGN KEY ("createdByProfileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commitment" ADD CONSTRAINT "Commitment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commitment" ADD CONSTRAINT "Commitment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commitment" ADD CONSTRAINT "Commitment_connectionGroupId_fkey" FOREIGN KEY ("connectionGroupId") REFERENCES "ConnectionGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_commitmentId_fkey" FOREIGN KEY ("commitmentId") REFERENCES "Commitment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stake" ADD CONSTRAINT "Stake_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stake" ADD CONSTRAINT "Stake_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
