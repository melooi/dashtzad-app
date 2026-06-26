-- CreateEnum
CREATE TYPE "SaleMode" AS ENUM ('AUTO', 'CONTACT', 'DISCONTINUED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "installmentEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "saleMode" "SaleMode" NOT NULL DEFAULT 'AUTO';
