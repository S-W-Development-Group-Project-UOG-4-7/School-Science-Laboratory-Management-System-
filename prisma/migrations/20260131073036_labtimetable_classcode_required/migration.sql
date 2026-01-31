/*
  Warnings:

  - Made the column `classCode` on table `LabTimetable` required. This step will fail if there are existing NULL values in that column.

*/
-- 1) Add column as nullable first
ALTER TABLE "LabTimetable" ADD COLUMN "classCode" TEXT;

-- 2) Backfill existing rows (IMPORTANT)
UPDATE "LabTimetable"
SET "classCode" = '10A'
WHERE "classCode" IS NULL;

-- AlterTable
ALTER TABLE "LabTimetable" ALTER COLUMN "classCode" SET NOT NULL;

-- CreateIndex
CREATE INDEX "LabTimetable_classCode_idx" ON "LabTimetable"("classCode");
ON "LabTimetable"("classCode");