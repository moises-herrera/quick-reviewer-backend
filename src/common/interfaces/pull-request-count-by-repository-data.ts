export interface PullRequestCountByRepositoryData {
  repositoryId: string;
  repository: {
    name: string;
    owner: {
      name: string;
    };
  };
}
