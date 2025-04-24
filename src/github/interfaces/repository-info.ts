export interface RepositoryInfo {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  settings?: {
    autoReviewEnabled: boolean;
    requestChangesWorkflowEnabled: boolean;
  } | null;
}
