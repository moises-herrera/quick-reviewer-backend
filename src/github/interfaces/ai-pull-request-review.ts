export interface AIPullRequestReview {
  generalComment: string;
  comments: AIPullRequestFileComment[];
}

export interface AIPullRequestFileComment {
  path: string;
  body: string;
  line?: number;
  position?: number;
}
