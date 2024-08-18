import { Component, Input, OnInit } from '@angular/core';
import { Notebook } from 'src/app/interfaces/notebook';
import { ProjectService } from 'src/app/services/project.service';
interface Folder {
  open: boolean;
  __files__?: any[];
  [key: string]: any;
}

@Component({
  selector: 'app-dataset-folder-view',
  templateUrl: './dataset-folder-view.component.html',
  styleUrls: ['./dataset-folder-view.component.scss']
})
export class DatasetFolderViewComponent implements OnInit {

  @Input() folder: Folder;
  @Input() notebook: Notebook;
  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {
  }

  toggleFolder(folder: any): void {
    folder.open = !folder.open;
  }

  datasetExists(file: any): boolean {
    // console.log("file : ", file);
    // console.log("notebook : ", this.notebook);
    return this.notebook.observableNotebookDatasets.some((dataset: any) => dataset.blobFileID === file.blobFileID);
  }

  toggleDataset(file: any): void {
    if (this.datasetExists(file)) {
      this.projectService.deleteDatasetFromNotebook(this.notebook.notebookID, file).subscribe(() => {
        // Remove the dataset from the notebook.observablehqDatasets array
        this.notebook.observableNotebookDatasets = this.notebook.observableNotebookDatasets.filter((dataset: any) => dataset.blobFileID !== file.blobFileID);
      });
    } else {
      this.projectService.addDatasetToNotebook(this.notebook.notebookID, file).subscribe((newDataset: any) => {
        // Add the new dataset to the notebook.observablehqDatasets array
        this.notebook.observableNotebookDatasets.push(newDataset);
      });
    }
    // console.log("datasets : ", this.notebook.observableNotebookDatasets);
  }

}
