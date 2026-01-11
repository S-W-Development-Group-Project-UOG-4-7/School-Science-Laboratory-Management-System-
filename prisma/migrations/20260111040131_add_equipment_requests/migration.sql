-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('GLASSWARE', 'INSTRUMENTS', 'CHEMICALS', 'SAFETY', 'OTHER');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'PREPARED', 'COMPLETED', 'REJECTED');

-- CreateTable
CREATE TABLE "lab_assistants" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "email" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_assistants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_requests" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "labAssistantId" INTEGER NOT NULL,
    "className" VARCHAR(50) NOT NULL,
    "grade" VARCHAR(20) NOT NULL,
    "subject" VARCHAR(100) NOT NULL,
    "practicalDate" TIMESTAMP(3) NOT NULL,
    "practicalTime" VARCHAR(100) NOT NULL,
    "additionalNotes" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "responseNote" TEXT,
    "responseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_items" (
    "id" SERIAL NOT NULL,
    "equipmentRequestId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "category" "EquipmentCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lab_assistants_userId_key" ON "lab_assistants"("userId");

-- CreateIndex
CREATE INDEX "equipment_requests_teacherId_idx" ON "equipment_requests"("teacherId");

-- CreateIndex
CREATE INDEX "equipment_requests_labAssistantId_idx" ON "equipment_requests"("labAssistantId");

-- CreateIndex
CREATE INDEX "equipment_requests_status_idx" ON "equipment_requests"("status");

-- CreateIndex
CREATE INDEX "equipment_requests_practicalDate_idx" ON "equipment_requests"("practicalDate");

-- CreateIndex
CREATE INDEX "equipment_items_equipmentRequestId_idx" ON "equipment_items"("equipmentRequestId");

-- AddForeignKey
ALTER TABLE "lab_assistants" ADD CONSTRAINT "lab_assistants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_requests" ADD CONSTRAINT "equipment_requests_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_requests" ADD CONSTRAINT "equipment_requests_labAssistantId_fkey" FOREIGN KEY ("labAssistantId") REFERENCES "lab_assistants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_items" ADD CONSTRAINT "equipment_items_equipmentRequestId_fkey" FOREIGN KEY ("equipmentRequestId") REFERENCES "equipment_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
