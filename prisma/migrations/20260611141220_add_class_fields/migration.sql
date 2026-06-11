-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "gradeLevel" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
