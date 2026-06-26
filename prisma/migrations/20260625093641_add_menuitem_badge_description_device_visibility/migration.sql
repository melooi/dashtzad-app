-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "desktopVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mobileVisible" BOOLEAN NOT NULL DEFAULT true;
