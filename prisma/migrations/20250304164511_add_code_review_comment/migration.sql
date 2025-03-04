-- CreateTable
CREATE TABLE "CodeReviewComment" (
    "id" TEXT NOT NULL,
    "codeReviewId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "diffHunk" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "replyToId" TEXT,

    CONSTRAINT "CodeReviewComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CodeReviewComment" ADD CONSTRAINT "CodeReviewComment_codeReviewId_fkey" FOREIGN KEY ("codeReviewId") REFERENCES "CodeReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
