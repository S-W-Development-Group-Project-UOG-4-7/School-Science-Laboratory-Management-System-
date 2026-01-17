/*
  Warnings:

  - You are about to drop the column `difficulty` on the `practicals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "practicals" DROP COLUMN "difficulty";

-- DropEnum
DROP TYPE "DifficultyLevel";
