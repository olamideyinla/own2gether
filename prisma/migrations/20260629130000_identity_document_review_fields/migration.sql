-- Add reviewer audit fields to IdentityDocument.
-- rejectionReason: stored when an admin rejects a document; shown back to the profile.
-- reviewedByName:  name of the admin who approved/rejected; audit trail only.

ALTER TABLE "IdentityDocument"
  ADD COLUMN "rejectionReason" TEXT,
  ADD COLUMN "reviewedByName"  TEXT;
