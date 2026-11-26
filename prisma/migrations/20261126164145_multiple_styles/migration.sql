-- Style becomes a list, so users can pick several.
-- Existing single choices are carried over before the old column is dropped.
ALTER TABLE "users" ADD COLUMN "styles" "clothing_style"[] DEFAULT ARRAY[]::"clothing_style"[];

UPDATE "users" SET "styles" = ARRAY["style"] WHERE "style" IS NOT NULL;

ALTER TABLE "users" DROP COLUMN "style";
