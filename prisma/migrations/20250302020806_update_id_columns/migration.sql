/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CodeReview` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PullRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Repository` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "CodeReview" DROP CONSTRAINT "CodeReview_pullRequestId_fkey";

-- DropForeignKey
ALTER TABLE "PullRequest" DROP CONSTRAINT "PullRequest_repositoryId_fkey";

-- DropForeignKey
ALTER TABLE "Repository" DROP CONSTRAINT "Repository_ownerId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGINT,
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "CodeReview" DROP CONSTRAINT "CodeReview_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGINT,
ALTER COLUMN "pullRequestId" SET DATA TYPE BIGINT,
ADD CONSTRAINT "CodeReview_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PullRequest" DROP CONSTRAINT "PullRequest_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGINT,
ALTER COLUMN "repositoryId" SET DATA TYPE BIGINT,
ADD CONSTRAINT "PullRequest_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Repository" DROP CONSTRAINT "Repository_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGINT,
ALTER COLUMN "ownerId" SET DATA TYPE BIGINT,
ADD CONSTRAINT "Repository_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeReview" ADD CONSTRAINT "CodeReview_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
