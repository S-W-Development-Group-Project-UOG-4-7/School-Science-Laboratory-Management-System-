-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Glassware', 'Equipment', 'Chemicals', 'Safety', 'Instruments');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "stockLevel" INTEGER NOT NULL,
    "minStockLevel" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "storageInstructions" TEXT NOT NULL,
    "handlingProcedure" TEXT NOT NULL,
    "safetyNotes" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryRequest" (
    "id" TEXT NOT NULL,
    "requesterName" TEXT NOT NULL,
    "requesterRole" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "urgency" "Urgency" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseDate" TIMESTAMP(3),
    "responseNote" TEXT,

    CONSTRAINT "InventoryRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InventoryRequest" ADD CONSTRAINT "InventoryRequest_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
