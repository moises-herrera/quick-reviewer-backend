/*
  Warnings:

  - Added the required column `nodeId` to the `PullRequest` table without a default value. This is not possible if the table is not empty.
  - Made the column `baseSha` on table `PullRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `headSha` on table `PullRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PullRequest" ADD COLUMN     "nodeId" TEXT NOT NULL,
ALTER COLUMN "baseSha" SET NOT NULL,
ALTER COLUMN "headSha" SET NOT NULL;
