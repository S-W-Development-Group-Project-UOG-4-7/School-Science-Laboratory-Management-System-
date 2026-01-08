/*
  Warnings:

  - Added the required column `updatedAt` to the `ScheduleAttachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ScheduleAttachment" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
