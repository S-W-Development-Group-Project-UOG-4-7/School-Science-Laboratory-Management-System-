/*
  Warnings:

  - The primary key for the `Practical` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdBy` on the `Practical` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Practical` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `Practical` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Practical` table. All the data in the column will be lost.
  - You are about to drop the column `labSheetUrl` on the `Practical` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `Practical` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ActivityLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InventoryItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InventoryRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LabSchedule` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[labId,day,period,date]` on the table `Practical` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `Practical` table without a default value. This is not possible if the table is not empty.
  - Added the required column `day` to the `Practical` table without a default value. This is not possible if the table is not empty.
  - Added the required column `labId` to the `Practical` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxStudents` to the `Practical` table without a default value. This is not possible if the table is not empty.
  - Added the required column `period` to the `Practical` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `Practical` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `grade` on the `Practical` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER', 'LAB_ASSISTANT');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY');

-- CreateEnum
CREATE TYPE "PracticalStatus" AS ENUM ('UPCOMING', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryRequest" DROP CONSTRAINT "InventoryRequest_requestedBy_fkey";

-- DropForeignKey
ALTER TABLE "LabSchedule" DROP CONSTRAINT "LabSchedule_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Practical" DROP CONSTRAINT "Practical_createdBy_fkey";

-- AlterTable
ALTER TABLE "Practical" DROP CONSTRAINT "Practical_pkey",
DROP COLUMN "createdBy",
DROP COLUMN "description",
DROP COLUMN "difficulty",
DROP COLUMN "duration",
DROP COLUMN "labSheetUrl",
DROP COLUMN "videoUrl",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "day" "DayOfWeek" NOT NULL,
ADD COLUMN     "labId" TEXT NOT NULL,
ADD COLUMN     "maxStudents" INTEGER NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "period" INTEGER NOT NULL,
ADD COLUMN     "status" "PracticalStatus" NOT NULL DEFAULT 'UPCOMING',
ADD COLUMN     "teacherId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "grade",
ADD COLUMN     "grade" INTEGER NOT NULL,
ADD CONSTRAINT "Practical_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Practical_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "phone",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropTable
DROP TABLE "ActivityLog";

-- DropTable
DROP TABLE "InventoryItem";

-- DropTable
DROP TABLE "InventoryRequest";

-- DropTable
DROP TABLE "LabSchedule";

-- CreateTable
CREATE TABLE "Lab" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherTimetable" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "period" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TeacherTimetable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTimetable" (
    "id" TEXT NOT NULL,
    "labId" TEXT NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "period" INTEGER NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LabTimetable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lab_name_key" ON "Lab"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherTimetable_teacherId_day_period_key" ON "TeacherTimetable"("teacherId", "day", "period");

-- CreateIndex
CREATE UNIQUE INDEX "LabTimetable_labId_day_period_key" ON "LabTimetable"("labId", "day", "period");

-- CreateIndex
CREATE UNIQUE INDEX "Practical_labId_day_period_date_key" ON "Practical"("labId", "day", "period", "date");

-- AddForeignKey
ALTER TABLE "TeacherTimetable" ADD CONSTRAINT "TeacherTimetable_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTimetable" ADD CONSTRAINT "LabTimetable_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practical" ADD CONSTRAINT "Practical_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practical" ADD CONSTRAINT "Practical_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
