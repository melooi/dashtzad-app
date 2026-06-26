-- CreateEnum
CREATE TYPE "ProductBaseUnit" AS ENUM ('GRAM', 'KILOGRAM', 'UNIT');

-- CreateEnum
CREATE TYPE "PackagingType" AS ENUM ('POUCH', 'TIN', 'VACUUM', 'BOX', 'BAG', 'SACK');

-- CreateEnum
CREATE TYPE "MarketingBadge" AS ENUM ('BESTSELLER', 'DASHTZAD_PICK', 'ECONOMICAL', 'GIFT', 'DAILY', 'HOSTING', 'LIMITED', 'NEW');

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "productVariantId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productVariantId" TEXT,
ADD COLUMN     "variantSku" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "basePriceUnit" "ProductBaseUnit" NOT NULL DEFAULT 'GRAM',
ADD COLUMN     "basePrice_rial" INTEGER,
ADD COLUMN     "story" TEXT;

-- CreateTable
CREATE TABLE "WeightPreset" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "gramValue" DOUBLE PRECISION NOT NULL,
    "compatibility" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeightPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackagingOption" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "PackagingType" NOT NULL,
    "capacityGram" DOUBLE PRECISION NOT NULL,
    "cost_rial" INTEGER NOT NULL,
    "compatibility" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackagingOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "weightPresetId" TEXT,
    "packagingOptionId" TEXT,
    "weightValue" DOUBLE PRECISION NOT NULL,
    "weightUnit" "ProductBaseUnit" NOT NULL DEFAULT 'GRAM',
    "gramValue" DOUBLE PRECISION NOT NULL,
    "sku" TEXT NOT NULL,
    "calculatedPrice_rial" INTEGER NOT NULL,
    "price_rial" INTEGER NOT NULL,
    "offPrice_rial" INTEGER,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPriceLocked" BOOLEAN NOT NULL DEFAULT false,
    "marketingBadge" "MarketingBadge",
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeightPreset_isActive_idx" ON "WeightPreset"("isActive");

-- CreateIndex
CREATE INDEX "PackagingOption_isActive_idx" ON "PackagingOption"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "ProductVariant_sku_idx" ON "ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "ProductVariant_isActive_idx" ON "ProductVariant"("isActive");

-- CreateIndex
CREATE INDEX "CartItem_productVariantId_idx" ON "CartItem"("productVariantId");

-- CreateIndex
CREATE INDEX "OrderItem_productVariantId_idx" ON "OrderItem"("productVariantId");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_weightPresetId_fkey" FOREIGN KEY ("weightPresetId") REFERENCES "WeightPreset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_packagingOptionId_fkey" FOREIGN KEY ("packagingOptionId") REFERENCES "PackagingOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
