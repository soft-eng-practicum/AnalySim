export interface Notebook{
  name: string,
  file: File,
  projectID: number,
}

export interface NotebookURL {
  name: string,
  url: string,
  projectID: number,
  type: string
}