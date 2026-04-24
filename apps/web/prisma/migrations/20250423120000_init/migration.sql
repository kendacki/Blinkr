-- CreateEnum
CREATE TYPE "BlinkStatus" AS ENUM ('PENDING', 'OPENED', 'CLAIMED', 'OFFRAMPED', 'EXPIRED', 'REFUNDED');

-- CreateTable
CREATE TABLE "Employer" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blink" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "contractorEmail" TEXT NOT NULL,
    "amountUsdc" DECIMAL(18,6) NOT NULL,
    "status" "BlinkStatus" NOT NULL DEFAULT 'PENDING',
    "escrowPDA" TEXT,
    "escrowTxSig" TEXT,
    "claimTxSig" TEXT,
    "walletAddress" TEXT,
    "credentialId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "Blink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfframpRequest" (
    "id" TEXT NOT NULL,
    "blinkId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amountUsdc" DECIMAL(18,6) NOT NULL,
    "fiatAmount" DECIMAL(18,2),
    "fiatCurrency" TEXT,
    "providerRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfframpRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employer_walletAddress_key" ON "Employer"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_credentialId_key" ON "Credential"("credentialId");

-- CreateIndex
CREATE INDEX "Credential_email_idx" ON "Credential"("email");

-- CreateIndex
CREATE INDEX "Blink_status_expiresAt_idx" ON "Blink"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "OfframpRequest_blinkId_idx" ON "OfframpRequest"("blinkId");

-- AddForeignKey
ALTER TABLE "Blink" ADD CONSTRAINT "Blink_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blink" ADD CONSTRAINT "Blink_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfframpRequest" ADD CONSTRAINT "OfframpRequest_blinkId_fkey" FOREIGN KEY ("blinkId") REFERENCES "Blink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
