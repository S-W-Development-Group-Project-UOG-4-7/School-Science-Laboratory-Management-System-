/*
  Warnings:

  - You are about to drop the `Schedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduleAttachment` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `status` on the `quiz_attempts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "QuizAttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleAttachment" DROP CONSTRAINT "ScheduleAttachment_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "quiz_attempts" DROP CONSTRAINT "quiz_attempts_studentId_fkey";

-- DropIndex
DROP INDEX "quiz_attempts_completedAt_idx";

-- AlterTable
ALTER TABLE "quiz_attempts" ALTER COLUMN "startedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "completedAt" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "QuizAttemptStatus" NOT NULL;

-- DropTable
DROP TABLE "Schedule";

-- DropTable
DROP TABLE "ScheduleAttachment";

-- CreateTable
CREATE TABLE "schedules" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "classSection" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "notes" TEXT,
    "maxStudents" INTEGER NOT NULL,
    "status" "ScheduleStatus" NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_attachments" (
    "id" SERIAL NOT NULL,
    "scheduleId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "schedules_grade_classSection_idx" ON "schedules"("grade", "classSection");

-- CreateIndex
CREATE INDEX "schedules_date_time_idx" ON "schedules"("date", "time");

-- CreateIndex
CREATE INDEX "schedule_attachments_scheduleId_idx" ON "schedule_attachments"("scheduleId");

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_attachments" ADD CONSTRAINT "schedule_attachments_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
