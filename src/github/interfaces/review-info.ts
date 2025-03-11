export interface ReviewInfo {
  id: number;
  createdAt: Date;
  reviewer: string;
  status: string;
  pullRequest: PullRequest;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  state: string;
  createdAt: Date;
  repository: Repository;
}

export interface Repository {
  id: number;
  name: string;
  owner: Owner;
}

export interface Owner {
  id: number;
  name: string;
}
