/*
  Warnings:

  - You are about to drop the column `TranscodingStatus` on the `File` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "TranscodingStatus",
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "s3key" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "transcodingStatus" BOOLEAN NOT NULL DEFAULT false;
