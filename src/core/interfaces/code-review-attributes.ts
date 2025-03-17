import { RepositoryAttributes } from './repository-attributes';

export interface CodeReviewAttributes extends RepositoryAttributes {
  pullRequestNumber: number;
  pullRequestId: string;
}
