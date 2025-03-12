import { AccountType, PullRequestComment } from '@prisma/client';

export const mapPullRequestComment = (
  data: {
    id: string | number;
    body?: string;
    user?: { login?: string; type?: string } | null;
    created_at?: string | number | Date;
    updated_at?: string | number | Date;
  },
  options?: {
    pullRequestId?: bigint;
    commitId?: string;
  },
): Partial<PullRequestComment> => {
  return {
    id: data.id as unknown as bigint,
    body: data.body,
    user: data.user?.login,
    userType: data.user?.type as AccountType,
    createdAt: new Date(data.created_at || Date.now()),
    updatedAt: new Date(data.updated_at || Date.now()),
    commitId: options?.commitId,
    pullRequestId: options?.pullRequestId,
  };
};
