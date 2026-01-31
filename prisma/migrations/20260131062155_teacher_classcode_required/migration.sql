/*
  Warnings:

  - Made the column `classCode` on table `TeacherTimetable` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TeacherTimetable" ALTER COLUMN "classCode" SET NOT NULL;
