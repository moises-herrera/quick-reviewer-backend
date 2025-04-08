export interface PullRequestInitialReviewTimeData {
  createdAt: Date;
  closedAt: Date | null;
  reviews: {
    createdAt: Date;
  }[];
}
