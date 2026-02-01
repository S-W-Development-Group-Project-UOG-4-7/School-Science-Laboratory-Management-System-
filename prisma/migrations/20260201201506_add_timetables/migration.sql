/*
  Warnings:

  - You are about to drop the column `handlingProcedure` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `storageInstructions` on the `InventoryItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InventoryItem" DROP COLUMN "handlingProcedure",
DROP COLUMN "storageInstructions",
ALTER COLUMN "lastUpdated" DROP DEFAULT;

-- CreateTable
CREATE TABLE "TeacherTimetable" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "period" INTEGER NOT NULL,
    "subject" TEXT,
    "grade" INTEGER,
    "classCode" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherTimetable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTimetable" (
    "id" TEXT NOT NULL,
    "labId" TEXT NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "period" INTEGER NOT NULL,
    "classCode" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabTimetable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherTimetable_teacherId_day_period_key" ON "TeacherTimetable"("teacherId", "day", "period");

-- CreateIndex
CREATE UNIQUE INDEX "LabTimetable_labId_day_period_key" ON "LabTimetable"("labId", "day", "period");

-- AddForeignKey
ALTER TABLE "TeacherTimetable" ADD CONSTRAINT "TeacherTimetable_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTimetable" ADD CONSTRAINT "LabTimetable_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
