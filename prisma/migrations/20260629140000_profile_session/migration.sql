CREATE TABLE "ProfileSession" (
    "id"        TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "token"     TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProfileSession_token_key" ON "ProfileSession"("token");
CREATE INDEX "ProfileSession_profileId_idx" ON "ProfileSession"("profileId");
CREATE INDEX "ProfileSession_token_idx" ON "ProfileSession"("token");

ALTER TABLE "ProfileSession"
    ADD CONSTRAINT "ProfileSession_profileId_fkey"
    FOREIGN KEY ("profileId") REFERENCES "Profile"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
