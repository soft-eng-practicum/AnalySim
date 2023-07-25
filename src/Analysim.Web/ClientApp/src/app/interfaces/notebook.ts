export interface NotebookFile{
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

export interface Notebook {
  notebookID: number,
  container: string,
  name: string,
  extension: string,
  size: number,
  uri: string,
  datecreated: Date,
  lastmodified: Date,
  projectid: number,
  type: string
}