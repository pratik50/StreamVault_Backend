-- AlterTable
ALTER TABLE "File" ADD COLUMN     "isTranscoded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "streamUrl" TEXT;
