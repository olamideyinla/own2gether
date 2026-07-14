-- CAC registration fields on Profile
ALTER TABLE "Profile" ADD COLUMN "dateOfBirth"        DATE;
ALTER TABLE "Profile" ADD COLUMN "nationality"        TEXT;
ALTER TABLE "Profile" ADD COLUMN "occupation"         TEXT;
ALTER TABLE "Profile" ADD COLUMN "residentialAddress" TEXT;

-- Document number and expiry on IdentityDocument
ALTER TABLE "IdentityDocument" ADD COLUMN "documentNumber" TEXT;
ALTER TABLE "IdentityDocument" ADD COLUMN "expiryDate"     DATE;
