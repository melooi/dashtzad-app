-- CreateEnum
CREATE TYPE "ArticleType" AS ENUM ('CASE_FILE', 'TASTE_STORY', 'FOOD_CULTURE', 'DID_YOU_KNOW', 'BRAND_UPDATE', 'TRICKS', 'ENCYCLOPEDIA', 'DIET_LIFESTYLE', 'HEALTH_MEDICAL');

-- AlterEnum
ALTER TYPE "SeoEntityType" ADD VALUE 'SERIES';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "articleType" "ArticleType",
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "relatedPostIds" TEXT[],
ADD COLUMN     "relatedProductIds" TEXT[],
ADD COLUMN     "seriesId" TEXT,
ADD COLUMN     "seriesOrder" INTEGER,
ADD COLUMN     "sources" JSONB,
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "typeMeta" JSONB;

-- CreateTable
CREATE TABLE "ContentSeries" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subtitle" TEXT,
    "summary" TEXT,
    "coverImage" TEXT,
    "intro" TEXT,
    "keyTopics" TEXT[],
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentSeries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentSeries_slug_key" ON "ContentSeries"("slug");

-- CreateIndex
CREATE INDEX "ContentSeries_slug_idx" ON "ContentSeries"("slug");

-- CreateIndex
CREATE INDEX "ContentSeries_status_idx" ON "ContentSeries"("status");

-- CreateIndex
CREATE INDEX "Post_articleType_idx" ON "Post"("articleType");

-- CreateIndex
CREATE INDEX "Post_seriesId_idx" ON "Post"("seriesId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "ContentSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
