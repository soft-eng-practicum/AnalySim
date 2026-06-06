export interface ProjectLog {
  logID: number;
  userID: number;
  authorName: string;
  projectID: number;
  title: string | null;
  referencedNotebookID: number | null;
  referencedNotebookVersion: number | null;
  referencedNotebook: ReferencedNotebook | null;
  image: string | null;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
}

export interface ReferencedNotebook {
  notebookID: number;
  name: string;
  extension: string;
  directory: string;
  type: string;
}