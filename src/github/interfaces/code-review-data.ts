export interface CodeReviewData {
  id: number;
  user: {
    login: string;
    type: string;
  };
  body?: string;
  submitted_at: string;
  state: string;
  commit_id: string;
}
