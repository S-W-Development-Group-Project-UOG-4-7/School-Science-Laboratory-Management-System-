/*
  Warnings:

  - You are about to drop the column `grade` on the `LabTimetable` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'PRINCIPAL';
ALTER TYPE "Role" ADD VALUE 'DEPUTY_PRINCIPAL';
ALTER TYPE "Role" ADD VALUE 'STUDENT';

-- AlterTable
ALTER TABLE "LabTimetable" DROP COLUMN "grade",
ADD COLUMN     "classCode" TEXT;
