-- Add type column with default value
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "type" VARCHAR(20);
ALTER TABLE "users" ALTER COLUMN "type" SET DEFAULT 'free';

-- Add attended column with default value
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "attended" BOOLEAN;
ALTER TABLE "users" ALTER COLUMN "attended" SET DEFAULT false;

-- Update existing rows with default values
UPDATE "users" SET "type" = 'free' WHERE "type" IS NULL;
UPDATE "users" SET "attended" = false WHERE "attended" IS NULL;
