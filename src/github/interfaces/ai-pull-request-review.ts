export interface AIPullRequestReview {
  generalComment: string;
  comments: AIPullRequestFileComment[];
  approved?: boolean;
}

export interface AIPullRequestFileComment {
  path: string;
  body: string;
  line?: number;
  position?: number;
  side?: 'RIGHT' | 'LEFT';
}
