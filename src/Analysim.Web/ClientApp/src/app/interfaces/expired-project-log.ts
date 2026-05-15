export interface ExpiredProjectLog {
  logID: number;
  authorName: string;
  projectTitle: string;
  title: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  expiredAt: string;
  commentCount: number;
}