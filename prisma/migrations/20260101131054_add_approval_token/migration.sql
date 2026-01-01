/*
  Warnings:

  - A unique constraint covering the columns `[approvalToken]` on the table `InventoryRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `approvalToken` to the `InventoryRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenExpiresAt` to the `InventoryRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InventoryRequest" ADD COLUMN     "approvalToken" TEXT NOT NULL,
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "InventoryRequest_approvalToken_key" ON "InventoryRequest"("approvalToken");
