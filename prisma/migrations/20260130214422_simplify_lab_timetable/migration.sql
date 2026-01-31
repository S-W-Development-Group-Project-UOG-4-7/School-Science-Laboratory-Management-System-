/*
  Warnings:

  - The values [DEPUTY_PRINCIPAL] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `gradeFrom` on the `LabTimetable` table. All the data in the column will be lost.
  - You are about to drop the column `gradeTo` on the `LabTimetable` table. All the data in the column will be lost.
  - Added the required column `grade` to the `LabTimetable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'TEACHER', 'LAB_ASSISTANT');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- AlterTable
ALTER TABLE "LabTimetable" DROP COLUMN "gradeFrom",
DROP COLUMN "gradeTo",
ADD COLUMN     "grade" INTEGER NOT NULL;
