/*
  Warnings:

  - The values [PREPARED,COMPLETED] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EquipmentCategory" ADD VALUE 'ELECTRONICS';
ALTER TYPE "EquipmentCategory" ADD VALUE 'BIOLOGY';

-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "equipment_requests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "equipment_requests" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "RequestStatus_old";
ALTER TABLE "equipment_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "equipment_requests" ADD COLUMN     "practicalScheduleId" INTEGER;

-- AlterTable
ALTER TABLE "lab_assistants" ADD COLUMN     "availability" TEXT[];

-- CreateTable
CREATE TABLE "practical_schedules" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "period" VARCHAR(20) NOT NULL,
    "grade" VARCHAR(20) NOT NULL,
    "className" VARCHAR(10) NOT NULL,
    "fullClassName" VARCHAR(100) NOT NULL,
    "subject" VARCHAR(50) NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "teacherName" VARCHAR(255) NOT NULL,
    "location" VARCHAR(100) NOT NULL DEFAULT 'Primary Lab',
    "notes" TEXT,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practical_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practical_schedule_attachments" (
    "id" SERIAL NOT NULL,
    "practicalScheduleId" INTEGER NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "fileUrl" VARCHAR(500) NOT NULL,
    "fileType" VARCHAR(50),
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practical_schedule_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "practical_schedules_teacherId_idx" ON "practical_schedules"("teacherId");

-- CreateIndex
CREATE INDEX "practical_schedules_date_idx" ON "practical_schedules"("date");

-- CreateIndex
CREATE INDEX "practical_schedules_grade_className_idx" ON "practical_schedules"("grade", "className");

-- CreateIndex
CREATE INDEX "practical_schedules_status_idx" ON "practical_schedules"("status");

-- CreateIndex
CREATE INDEX "practical_schedule_attachments_practicalScheduleId_idx" ON "practical_schedule_attachments"("practicalScheduleId");

-- CreateIndex
CREATE INDEX "equipment_requests_practicalScheduleId_idx" ON "equipment_requests"("practicalScheduleId");

-- AddForeignKey
ALTER TABLE "practical_schedules" ADD CONSTRAINT "practical_schedules_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practical_schedule_attachments" ADD CONSTRAINT "practical_schedule_attachments_practicalScheduleId_fkey" FOREIGN KEY ("practicalScheduleId") REFERENCES "practical_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_requests" ADD CONSTRAINT "equipment_requests_practicalScheduleId_fkey" FOREIGN KEY ("practicalScheduleId") REFERENCES "practical_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
