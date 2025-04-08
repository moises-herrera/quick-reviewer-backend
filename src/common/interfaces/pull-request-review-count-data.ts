export interface PullRequestReviewCountData {
  repositoryId: string;
  repository: {
    name: string;
    owner: {
      name: string;
    };
  };
  reviews: {
    id: string;
  }[];
}
