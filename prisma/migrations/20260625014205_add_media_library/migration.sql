-- CreateEnum
CREATE TYPE "MediaStorage" AS ENUM ('LOCAL', 'VERCEL_BLOB', 'S3');

-- CreateEnum
CREATE TYPE "MediaUsage" AS ENUM ('PRODUCT', 'BANNER', 'HOMEPAGE', 'BRAND', 'SEO', 'BLOG', 'RECIPE', 'GENERAL');

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt" TEXT,
    "title" TEXT,
    "caption" TEXT,
    "storage" "MediaStorage" NOT NULL DEFAULT 'LOCAL',
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "folder" TEXT,
    "tags" TEXT[],
    "usage" "MediaUsage",
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaAsset_mimeType_idx" ON "MediaAsset"("mimeType");

-- CreateIndex
CREATE INDEX "MediaAsset_storage_idx" ON "MediaAsset"("storage");

-- CreateIndex
CREATE INDEX "MediaAsset_usage_idx" ON "MediaAsset"("usage");

-- CreateIndex
CREATE INDEX "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
