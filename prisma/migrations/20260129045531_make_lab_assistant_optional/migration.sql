-- DropForeignKey
ALTER TABLE "equipment_requests" DROP CONSTRAINT "equipment_requests_labAssistantId_fkey";

-- AlterTable
ALTER TABLE "equipment_requests" ALTER COLUMN "labAssistantId" DROP NOT NULL,
ALTER COLUMN "className" SET DATA TYPE TEXT,
ALTER COLUMN "grade" SET DATA TYPE TEXT,
ALTER COLUMN "subject" SET DATA TYPE TEXT,
ALTER COLUMN "practicalTime" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "equipment_requests" ADD CONSTRAINT "equipment_requests_labAssistantId_fkey" FOREIGN KEY ("labAssistantId") REFERENCES "lab_assistants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
