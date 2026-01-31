/*
  Warnings:

  - The primary key for the `ActivityLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `InventoryItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `minQuantity` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `InventoryItem` table. All the data in the column will be lost.
  - The primary key for the `InventoryRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `itemName` on the `InventoryRequest` table. All the data in the column will be lost.
  - You are about to drop the column `requestedBy` on the `InventoryRequest` table. All the data in the column will be lost.
  - You are about to drop the column `response` on the `InventoryRequest` table. All the data in the column will be lost.
  - The `status` column on the `InventoryRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `LabSchedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Practical` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `unit` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemId` to the `InventoryRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `neededDate` to the `InventoryRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestedById` to the `InventoryRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `InventoryRequest` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `priority` on the `InventoryRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PRINCIPAL', 'TEACHER', 'LAB_ASSISTANT', 'STUDENT', 'DEPUTY_PRINCIPLE');

-- CreateEnum
CREATE TYPE "RequestPriority" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'approved', 'rejected', 'in_progress', 'fulfilled');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('fulfillment', 'approval', 'rejection', 'request');

-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryRequest" DROP CONSTRAINT "InventoryRequest_requestedBy_fkey";

-- DropForeignKey
ALTER TABLE "LabSchedule" DROP CONSTRAINT "LabSchedule_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Practical" DROP CONSTRAINT "Practical_createdBy_fkey";

-- AlterTable
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "details" DROP NOT NULL,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ActivityLog_id_seq";

-- AlterTable
ALTER TABLE "InventoryItem" DROP CONSTRAINT "InventoryItem_pkey",
DROP COLUMN "minQuantity",
DROP COLUMN "quantity",
DROP COLUMN "status",
ADD COLUMN     "handlingProcedure" TEXT,
ADD COLUMN     "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "minStockLevel" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "safetyNotes" TEXT,
ADD COLUMN     "stockLevel" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "storageInstructions" TEXT,
ADD COLUMN     "unit" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "InventoryItem_id_seq";

-- AlterTable
ALTER TABLE "InventoryRequest" DROP CONSTRAINT "InventoryRequest_pkey",
DROP COLUMN "itemName",
DROP COLUMN "requestedBy",
DROP COLUMN "response",
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "approvedDate" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fulfilledById" TEXT,
ADD COLUMN     "fulfilledDate" TIMESTAMP(3),
ADD COLUMN     "fulfilledQuantity" INTEGER,
ADD COLUMN     "itemId" TEXT NOT NULL,
ADD COLUMN     "neededDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "rejectedById" TEXT,
ADD COLUMN     "rejectedDate" TIMESTAMP(3),
ADD COLUMN     "requestedById" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "priority",
ADD COLUMN     "priority" "RequestPriority" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "RequestStatus" NOT NULL DEFAULT 'pending',
ADD CONSTRAINT "InventoryRequest_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "InventoryRequest_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "phone",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropTable
DROP TABLE "LabSchedule";

-- DropTable
DROP TABLE "Practical";

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

-- AddForeignKey
ALTER TABLE "InventoryRequest" ADD CONSTRAINT "InventoryRequest_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryRequest" ADD CONSTRAINT "InventoryRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryRequest" ADD CONSTRAINT "InventoryRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryRequest" ADD CONSTRAINT "InventoryRequest_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryRequest" ADD CONSTRAINT "InventoryRequest_fulfilledById_fkey" FOREIGN KEY ("fulfilledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "InventoryRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
