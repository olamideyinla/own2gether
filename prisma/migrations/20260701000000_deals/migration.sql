-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('rehabilitation', 'ground_up', 'off_plan');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('coming_soon', 'open', 'funded', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "DealCommitmentStatus" AS ENUM ('pending', 'allocated', 'payment_submitted', 'paid', 'withdrawn', 'refunded');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('upcoming', 'in_progress', 'completed', 'delayed');

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "dealType" "DealType" NOT NULL,
    "status" "DealStatus" NOT NULL DEFAULT 'coming_soon',
    "targetRaise" DECIMAL(15,2) NOT NULL,
    "minCommitment" DECIMAL(15,2) NOT NULL,
    "projectedReturnPct" DECIMAL(6,2),
    "projectedDurationMonths" INTEGER,
    "investorProfitSplitPct" DECIMAL(5,2) NOT NULL DEFAULT 60,
    "photos" TEXT[],
    "videos" TEXT[],
    "documents" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt" TIMESTAMP(3),
    "fundedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealCommitment" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "status" "DealCommitmentStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allocationConfirmedAt" TIMESTAMP(3),
    "paymentDueAt" TIMESTAMP(3),
    "paymentReceiptUrl" TEXT,
    "paymentSubmittedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "DealCommitment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealMilestone" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" DATE,
    "completedAt" TIMESTAMP(3),
    "status" "MilestoneStatus" NOT NULL DEFAULT 'upcoming',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DealMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealUpdate" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "photoUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DealCommitment_dealId_idx" ON "DealCommitment"("dealId");
CREATE INDEX "DealCommitment_profileId_idx" ON "DealCommitment"("profileId");
CREATE INDEX "DealMilestone_dealId_idx" ON "DealMilestone"("dealId");
CREATE INDEX "DealUpdate_dealId_idx" ON "DealUpdate"("dealId");

-- AddForeignKey
ALTER TABLE "DealCommitment" ADD CONSTRAINT "DealCommitment_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DealCommitment" ADD CONSTRAINT "DealCommitment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DealMilestone" ADD CONSTRAINT "DealMilestone_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DealUpdate" ADD CONSTRAINT "DealUpdate_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
