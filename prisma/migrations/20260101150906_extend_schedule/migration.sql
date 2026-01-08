/*
  Warnings:

  - You are about to drop the column `description` on the `schedules` table. All the data in the column will be lost.
  - Added the required column `duration` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grade` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxStudents` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "description",
ADD COLUMN     "daySchedule" TEXT,
ADD COLUMN     "duration" VARCHAR(50) NOT NULL,
ADD COLUMN     "grade" VARCHAR(20) NOT NULL,
ADD COLUMN     "location" VARCHAR(255) NOT NULL,
ADD COLUMN     "maxStudents" INTEGER NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'upcoming',
ADD COLUMN     "studentRequirements" TEXT,
ADD COLUMN     "subject" VARCHAR(100) NOT NULL,
ADD COLUMN     "time" VARCHAR(10) NOT NULL;

-- CreateIndex
CREATE INDEX "schedules_status_idx" ON "schedules"("status");
