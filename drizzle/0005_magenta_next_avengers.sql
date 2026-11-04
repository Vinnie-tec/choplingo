ALTER TABLE "recipes"
ADD COLUMN "status" varchar(20) DEFAULT 'draft' NOT NULL;

UPDATE "recipes"
SET "status" = 'published';