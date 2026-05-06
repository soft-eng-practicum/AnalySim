import { ProjectCommentFlag } from "./project-comment-flag";
import { ProjectCommentLike } from "./project-comment-like";

export interface ProjectComment {
  commentID: number;
  userID: number;
  authorName: string;
  projectID: number;
  projectLogID: number | null;
  parentCommentID: number | null;
  content: string;
  isDeleted: boolean;
  isPendingReview: boolean;
  createdAt: string;
  updatedAt: string;
  replies: ProjectComment[];
  commentLikes: ProjectCommentLike[];
  commentFlags: ProjectCommentFlag[];
}