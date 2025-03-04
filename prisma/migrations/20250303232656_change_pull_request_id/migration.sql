/*
  Warnings:

  - The primary key for the `PullRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "CodeReview" DROP CONSTRAINT "CodeReview_pullRequestId_fkey";

-- AlterTable
ALTER TABLE "CodeReview" ALTER COLUMN "pullRequestId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "PullRequest" DROP CONSTRAINT "PullRequest_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PullRequest_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "CodeReview" ADD CONSTRAINT "CodeReview_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
