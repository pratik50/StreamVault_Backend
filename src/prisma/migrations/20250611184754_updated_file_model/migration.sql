/*
  Warnings:

  - You are about to drop the column `isTranscoded` on the `File` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "isTranscoded",
ADD COLUMN     "isFullyTranscoded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTranscoded720" BOOLEAN NOT NULL DEFAULT false;
