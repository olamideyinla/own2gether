ALTER TABLE "Property" ADD COLUMN "description" TEXT;
ALTER TABLE "Property" ADD COLUMN "videos" TEXT[] NOT NULL DEFAULT '{}';
