/*
  Warnings:

  - The primary key for the `Inventory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Inventory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `InventoryRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `InventoryRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `itemId` on the `InventoryRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "InventoryRequest" DROP CONSTRAINT "InventoryRequest_itemId_fkey";

-- AlterTable
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "lastUpdated" DROP DEFAULT,
ADD CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "InventoryRequest" DROP CONSTRAINT "InventoryRequest_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "itemId",
ADD COLUMN     "itemId" INTEGER NOT NULL,
ADD CONSTRAINT "InventoryRequest_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "InventoryRequest" ADD CONSTRAINT "InventoryRequest_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
