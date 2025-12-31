/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RequesterRole" AS ENUM ('LAB_ASSISTANT', 'ADMIN');

-- CreateEnum
CREATE TYPE "Subject" AS ENUM ('Physics', 'Chemistry', 'Biology');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('UPCOMING', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Inventory" ALTER COLUMN "photo" DROP NOT NULL,
ALTER COLUMN "storageInstructions" DROP NOT NULL,
ALTER COLUMN "handlingProcedure" DROP NOT NULL,
ALTER COLUMN "safetyNotes" DROP NOT NULL;

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "PracticalSchedule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" "Subject" NOT NULL,
    "grade" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "teacher" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "notes" TEXT,
    "maxStudents" INTEGER NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticalSchedule_pkey" PRIMARY KEY ("id")
);
