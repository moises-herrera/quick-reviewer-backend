export interface ReviewInfo {
  id: string;
  createdAt: Date;
  reviewer: string;
  status: string;
  pullRequest: PullRequest;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  state: string;
  createdAt: Date;
  repository: Repository;
}

export interface Repository {
  id: string;
  name: string;
  owner: Owner;
}

export interface Owner {
  id: string;
  name: string;
}
