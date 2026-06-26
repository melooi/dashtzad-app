-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "description" TEXT,
ADD COLUMN     "firstOrderOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "perUserLimit" INTEGER,
ADD COLUMN     "startsAt" TIMESTAMP(3),
ADD COLUMN     "title" TEXT;
