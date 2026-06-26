-- AlterTable
ALTER TABLE "ai_conversations" ADD COLUMN     "operatorNote" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

