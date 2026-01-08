-- AlterTable
ALTER TABLE "schedule_attachments" ALTER COLUMN "fileType" DROP NOT NULL,
ALTER COLUMN "fileSize" DROP NOT NULL;

-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "daySchedule" TEXT,
ADD COLUMN     "studentRequirements" TEXT;
