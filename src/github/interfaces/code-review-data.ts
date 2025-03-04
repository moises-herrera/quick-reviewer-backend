export interface CodeReviewData {
  id: number;
  node_id: string;
  user: {
    login: string;
  };
  submitted_at: string;
  state: string;
}
