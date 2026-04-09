import { ProjectCommentFlag } from "./project-comment-flag";
import { ProjectCommentLike } from "./project-comment-like";

export interface ProjectComment {
  commentID: number;
  userID: number;
  authorName: string;
  projectID: number;
  parentCommentID: number | null;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  replies: ProjectComment[];
  commentLikes: ProjectCommentLike[];
  commentFlags: ProjectCommentFlag[];
}