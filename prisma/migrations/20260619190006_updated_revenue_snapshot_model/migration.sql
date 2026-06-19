/*
  Warnings:

  - Added the required column `netRevenue` to the `RevenueSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalExpenses` to the `RevenueSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RevenueSnapshot" ADD COLUMN     "netRevenue" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "totalExpenses" DECIMAL(12,2) NOT NULL;
