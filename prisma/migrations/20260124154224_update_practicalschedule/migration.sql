/*
  Warnings:

  - You are about to drop the `practical_schedules` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "equipment_requests" DROP CONSTRAINT "equipment_requests_practicalScheduleId_fkey";

-- DropForeignKey
ALTER TABLE "practical_schedule_attachments" DROP CONSTRAINT "practical_schedule_attachments_practicalScheduleId_fkey";

-- DropForeignKey
ALTER TABLE "practical_schedules" DROP CONSTRAINT "practical_schedules_teacherId_fkey";

-- DropTable
DROP TABLE "practical_schedules";

-- CreateTable
CREATE TABLE "PracticalSchedule" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "period" VARCHAR(20) NOT NULL,
    "grade" VARCHAR(20) NOT NULL,
    "className" VARCHAR(10) NOT NULL,
    "fullClassName" VARCHAR(100) NOT NULL,
    "subject" VARCHAR(50) NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "location" VARCHAR(100) NOT NULL DEFAULT 'Primary Lab',
    "notes" TEXT,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticalSchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PracticalSchedule" ADD CONSTRAINT "PracticalSchedule_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practical_schedule_attachments" ADD CONSTRAINT "practical_schedule_attachments_practicalScheduleId_fkey" FOREIGN KEY ("practicalScheduleId") REFERENCES "PracticalSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_requests" ADD CONSTRAINT "equipment_requests_practicalScheduleId_fkey" FOREIGN KEY ("practicalScheduleId") REFERENCES "PracticalSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
