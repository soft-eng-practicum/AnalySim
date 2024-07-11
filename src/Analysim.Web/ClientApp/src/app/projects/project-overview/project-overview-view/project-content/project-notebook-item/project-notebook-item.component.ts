import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Notebook } from '../../../../../interfaces/notebook';
import { ProjectService } from '../../../../../services/project.service';
import { Project } from 'src/app/interfaces/project';

@Component({
  selector: 'app-project-notebook-item',
  templateUrl: './project-notebook-item.component.html',
  styleUrls: ['./project-notebook-item.component.scss']
})
export class ProjectNotebookItemComponent implements OnInit {

  constructor(private modalService: BsModalService, private router: Router, private projectService: ProjectService) { }


  @Input() project: Project;
  @Input() notebook: Notebook;
  @ViewChild('displayNotebookModal') displayNotebookModal: TemplateRef<any>;

  @ViewChild('displayRenameNotebookModal') displayRenameNotebookModal: TemplateRef<any>;
  @ViewChild('displayDatasetsModal') displayDatasetsModal: TemplateRef<any>;

  @Input() currentDirectory: string;

  @Input() isMember: boolean;

  @Output() navigateToNewDirectory: EventEmitter<string> = new EventEmitter<string>();


  displayNotebookModalRef: BsModalRef;

  displayRenameNotebookModalRef: BsModalRef;

  displayDatasetsModalRef: BsModalRef;

  @Output() getNotebooks: EventEmitter<string> = new EventEmitter<string>();

  @Output() setCurrentNotebook: EventEmitter<Notebook> = new EventEmitter<Notebook>();
  versions: number[] = [];
  selectedVersion: number = 0;

  ngOnInit(): void {
    if (this.notebook.type === "new") {
      this.loadVersions();
    }
  }

  loadVersions() {
    this.projectService.getNotebookVersions(this.notebook).subscribe(versions => {
      this.versions = versions;
      //console.log("Versions: ", this.versions);
      if (this.versions.length > 0) {
        this.selectedVersion = this.versions[0]; // Default to the latest version
      }
    });
  }

  onVersionChange(version: number) {
    this.selectedVersion = version;
  }

  showNotebook() {
    this.displayNotebookModalRef = this.modalService.show(this.displayNotebookModal);
  }

  showRenameNotebookModal() {
    this.displayRenameNotebookModalRef = this.modalService.show(this.displayRenameNotebookModal);
  }

  showDatasetsModal() {
    this.displayDatasetsModalRef = this.modalService.show(this.displayDatasetsModal);
  }

  closeRenameNotebookModal() {
    this.displayRenameNotebookModalRef.hide();
  }

  closeDatasetModal() {
    this.displayDatasetsModalRef.hide();
  }

  navigate() {
    this.router.navigate([this.router.url + "/" + this.notebook.name]);
  }

  changeNotebookName(notebookName: string) {
    this.notebook.name = notebookName;
  }

  navigateToNotebook() {
    this.setCurrentNotebook.emit(this.notebook);
    let datasetParams = {};
    if (this.notebook.type === "observable") {
      this.notebook.observableNotebookDatasets.forEach(observableNotebook => {
        datasetParams[observableNotebook.datasetName] = observableNotebook.datasetURL;
      })
    }
    this.router.navigate([this.router.url + "/" + this.notebook.name], {
      queryParams: {
        isNotebook: true,
        notebookId: this.notebook.notebookID,
        version: this.selectedVersion,
        ...datasetParams
      }, queryParamsHandling: 'merge'
    });
  }

  deleteNotebook() {
    console.log("the notebook to be deleted is : ", this.notebook);
    this.projectService.getProjectByID(this.project.projectID).subscribe(result => {
      this.project = result;
      console.log("the project is : ", this.project);
      if (this.notebook.type === "folder") {
        let notebooks = this.project.notebooks.filter(notebook => notebook.directory === this.currentDirectory + this.notebook.name + "/");
        if (notebooks.length > 0) {
          return alert("folder is not empty !!");
        }
      }
      this.projectService.deleteNotebook(this.notebook.notebookID, this.selectedVersion, this.isMember).subscribe(res => {
        this.getNotebooks.emit(this.currentDirectory);
      })
    });
  }

  downloadNotebook() {
    this.projectService.downloadNotebook(this.notebook, this.selectedVersion).subscribe(res => {
      let url = window.URL.createObjectURL(res);
      let a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = this.notebook.name + "_v" + this.selectedVersion + this.notebook.extension;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    })
  }

  goBack() {
    console.log("Go Back");
  }

  openObservableNotebook() {
    let datasetParams = {};
    if (this.notebook.type === "observable") {
      this.notebook.observableNotebookDatasets.forEach(observableNotebook => {
        datasetParams[observableNotebook.datasetName] = observableNotebook.datasetURL;
      })
      let url = this.notebook.uri + "?";
      let queryParams = []
      for (const key of Object.keys(datasetParams)) {
        queryParams.push(key + "=" + datasetParams[key]);
      }
      url += queryParams.join('&');
      window.open(url, '_blank');
    }
  }

}
