export interface ProjectCommentFlag {
  flagID: number;
  commentID: number;
  userID: number;
  commentContentSnapshot: string;
  createdAt: string;
}

export interface FlaggedCommentGroup {
  commentID: number;
  commentOwnerUsername: string;
  commentProjectName: string;
  commentProjectOwner: string;
  flags: ProjectCommentFlagRow[];
}

export interface ProjectCommentFlagRow {
  flagID: number;
  commentContentSnapshot: string;
  flaggedByUsername: string;
  createdAt: string;
}