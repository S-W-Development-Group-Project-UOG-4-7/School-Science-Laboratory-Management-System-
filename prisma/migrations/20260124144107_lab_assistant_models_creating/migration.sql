/*
  Warnings:

  - You are about to drop the `Practical` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VideoView` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Glassware', 'Equipment', 'Chemicals', 'Safety', 'Instruments');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- DropForeignKey
ALTER TABLE "Practical" DROP CONSTRAINT "Practical_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_practicalId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_uploadedById_fkey";

-- DropTable
DROP TABLE "Practical";

-- DropTable
DROP TABLE "Video";

-- DropTable
DROP TABLE "VideoView";

-- DropEnum
DROP TYPE "DifficultyLevel";

-- DropEnum
DROP TYPE "Subject";

-- DropEnum
DROP TYPE "VideoType";

-- CreateTable
CREATE TABLE "Inventory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "stockLevel" INTEGER NOT NULL,
    "minStockLevel" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "photo" TEXT,
    "storageInstructions" TEXT,
    "handlingProcedure" TEXT,
    "safetyNotes" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryRequest" (
    "id" SERIAL NOT NULL,
    "requesterName" TEXT NOT NULL,
    "requesterRole" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "urgency" "Urgency" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseDate" TIMESTAMP(3),
    "responseNote" TEXT,
    "approvalToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryRequest_approvalToken_key" ON "InventoryRequest"("approvalToken");

-- AddForeignKey
ALTER TABLE "InventoryRequest" ADD CONSTRAINT "InventoryRequest_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
