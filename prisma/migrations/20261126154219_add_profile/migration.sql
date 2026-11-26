-- CreateEnum
CREATE TYPE "sex" AS ENUM ('FEMALE', 'MALE', 'OTHER');

-- CreateEnum
CREATE TYPE "clothing_style" AS ENUM ('CASUAL', 'SMART_CASUAL', 'FORMAL', 'STREETWEAR', 'SPORTY', 'MINIMALIST', 'CLASSIC', 'BOHEMIAN', 'VINTAGE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "height_cm" INTEGER,
ADD COLUMN     "sex" "sex",
ADD COLUMN     "style" "clothing_style",
ADD COLUMN     "weight_kg" DOUBLE PRECISION;
