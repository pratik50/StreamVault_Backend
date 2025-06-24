/*
  Warnings:

  - You are about to drop the column `isFullyTranscoded` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `isTranscoded720` on the `File` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "isFullyTranscoded",
DROP COLUMN "isTranscoded720",
ADD COLUMN     "TranscodingStatus" BOOLEAN NOT NULL DEFAULT false;
