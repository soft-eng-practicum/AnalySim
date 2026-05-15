import { ProjectComment } from "./project-comment";

export interface ProjectLog {
  logID: number;
  userID: number;
  authorName: string;
  projectID: number;
  title: string | null;
  image: string | null;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
}