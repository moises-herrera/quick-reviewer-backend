export interface CodeReviewData {
  id: number;
  user: {
    login: string;
  };
  submitted_at: string;
  state: string;
}
