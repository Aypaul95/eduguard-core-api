/*
  Warnings:

  - The `status` column on the `StudentFeeAssignment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StudentFeeAssignmentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID');

-- AlterTable
ALTER TABLE "StudentFeeAssignment" DROP COLUMN "status",
ADD COLUMN     "status" "StudentFeeAssignmentStatus" NOT NULL DEFAULT 'UNPAID';
