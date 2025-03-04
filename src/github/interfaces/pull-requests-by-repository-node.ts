export interface PullRequestNode {
  databaseId: number;
  number: number;
  title: string;
  state: string;
  url: string;
  author: { login: string };
  createdAt: string;
  updatedAt: string;
  closedAt: string;
  additions: number;
  deletions: number;
  changedFiles: number;
}

export interface PageInfo {
  endCursor: string;
  hasNextPage: boolean;
}

export interface PullRequestsConnection {
  nodes: PullRequestNode[];
  pageInfo: PageInfo;
}

export interface PullRequestsByRepositoryNode {
  repository: {
    databaseId: number;
    pullRequests: PullRequestsConnection;
  };
}
