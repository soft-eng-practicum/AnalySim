import { ObservableHQDataset } from "./observablehqDatasets";

export interface NotebookFile {
  name: string,
  file: File,
  projectID: number,
}

export interface NotebookURL {
  name: string,
  url: string,
  projectID: number,
  type: string,
  datasets: ObservableHQDataset[]
}

export interface Notebook {
  notebookID: number,
  container: string,
  name: string,
  extension: string,
  size: number,
  uri: string,
  dateCreated: Date,
  lastModified: Date,
  projectID: number,
  type: string,
  directory: string,
  route: string,
  observableNotebookDatasets: ObservableHQDataset[]
}
