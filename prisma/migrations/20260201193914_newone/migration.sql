/*
  Warnings:

  - You are about to drop the column `gradeFrom` on the `Lab` table. All the data in the column will be lost.
  - You are about to drop the column `gradeTo` on the `Lab` table. All the data in the column will be lost.
  - You are about to drop the `LabTimetable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Practical` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeacherTimetable` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Lab` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('fulfillment', 'approval', 'rejection', 'request');

-- CreateEnum
CREATE TYPE "RequestPriority" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'approved', 'rejected', 'in_progress', 'fulfilled');

-- DropForeignKey
ALTER TABLE "LabTimetable" DROP CONSTRAINT "LabTimetable_labId_fkey";

-- DropForeignKey
ALTER TABLE "Practical" DROP CONSTRAINT "Practical_labId_fkey";

-- DropForeignKey
ALTER TABLE "Practical" DROP CONSTRAINT "Practical_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherTimetable" DROP CONSTRAINT "TeacherTimetable_teacherId_fkey";

-- AlterTable
ALTER TABLE "Lab" DROP COLUMN "gradeFrom",
DROP COLUMN "gradeTo",
ADD COLUMN     "location" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "LabTimetable";

-- DropTable
DROP TABLE "Practical";

-- DropTable
DROP TABLE "TeacherTimetable";

-- DropEnum
DROP TYPE "PracticalStatus";

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "stockLevel" INTEGER NOT NULL DEFAULT 0,
    "minStockLevel" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "photo" TEXT,
    "storageInstructions" TEXT,
    "handlingProcedure" TEXT,
    "safetyNotes" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryRequest" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priority" "RequestPriority" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',
    "reason" TEXT NOT NULL,
    "neededDate" TIMESTAMP(3) NOT NULL,
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedDate" TIMESTAMP(3),
    "rejectedById" TEXT,
    "rejectedDate" TIMESTAMP(3),
    "fulfilledById" TEXT,
    "fulfilledDate" TIMESTAMP(3),
    "fulfilledQuantity" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabSchedule" (
    "id" TEXT NOT NULL,
    "labId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "period" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "subject" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LabSchedule_labId_day_period_date_key" ON "LabSchedule"("labId", "day", "period", "date");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryRequest" ADD CONSTRAINT "InventoryRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryRequest" ADD CONSTRAINT "InventoryRequest_fulfilledById_fkey" FOREIGN KEY ("fulfilledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryRequest" ADD CONSTRAINT "InventoryRequest_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryRequest" ADD CONSTRAINT "InventoryRequest_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryRequest" ADD CONSTRAINT "InventoryRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabSchedule" ADD CONSTRAINT "LabSchedule_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabSchedule" ADD CONSTRAINT "LabSchedule_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "InventoryRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
