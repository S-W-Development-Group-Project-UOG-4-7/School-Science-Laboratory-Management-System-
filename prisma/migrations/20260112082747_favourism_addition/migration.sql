-- AlterTable
ALTER TABLE "User" ADD COLUMN     "customPrivileges" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "revokedPrivileges" TEXT[] DEFAULT ARRAY[]::TEXT[];
