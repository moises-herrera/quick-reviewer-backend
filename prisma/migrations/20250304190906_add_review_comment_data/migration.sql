/*
  Warnings:

  - Added the required column `side` to the `CodeReviewComment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CodeReviewComment" ADD COLUMN     "line" INTEGER,
ADD COLUMN     "position" INTEGER,
ADD COLUMN     "side" TEXT NOT NULL;
