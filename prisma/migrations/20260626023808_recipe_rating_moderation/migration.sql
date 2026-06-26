-- CreateEnum
CREATE TYPE "RatingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RatingSource" AS ENUM ('USER', 'GUEST');

-- DropForeignKey
ALTER TABLE "PostRating" DROP CONSTRAINT "PostRating_userId_fkey";

-- AlterTable
ALTER TABLE "PostRating" ADD COLUMN     "feedbackReasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "feedbackText" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedByAdminId" TEXT,
ADD COLUMN     "source" "RatingSource" NOT NULL DEFAULT 'USER',
ADD COLUMN     "status" "RatingStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "userId" SET NOT NULL;

-- CreateTable
CREATE TABLE "RecipeGuestRating" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "feedbackText" TEXT,
    "feedbackReasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "guestName" TEXT,
    "guestPhone" TEXT,
    "guestKeyHash" TEXT NOT NULL,
    "status" "RatingStatus" NOT NULL DEFAULT 'PENDING',
    "source" "RatingSource" NOT NULL DEFAULT 'GUEST',
    "reviewedAt" TIMESTAMP(3),
    "reviewedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeGuestRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecipeGuestRating_postId_idx" ON "RecipeGuestRating"("postId");

-- CreateIndex
CREATE INDEX "RecipeGuestRating_status_idx" ON "RecipeGuestRating"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeGuestRating_postId_guestKeyHash_key" ON "RecipeGuestRating"("postId", "guestKeyHash");

-- CreateIndex
CREATE INDEX "PostRating_status_idx" ON "PostRating"("status");

-- AddForeignKey
ALTER TABLE "PostRating" ADD CONSTRAINT "PostRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeGuestRating" ADD CONSTRAINT "RecipeGuestRating_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

