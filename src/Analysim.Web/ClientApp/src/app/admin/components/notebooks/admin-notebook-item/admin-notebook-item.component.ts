import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Notebook } from '../../../../interfaces/notebook';
import { ProjectService } from '../../../../services/project.service';

@Component({
  selector: 'app-admin-notebook-item',
  templateUrl: './admin-notebook-item.component.html',
  styleUrls: ['./admin-notebook-item.component.scss']
})
export class AdminNotebookItemComponent implements OnInit {

  constructor(private modalService: BsModalService, private router: Router, private projectService: ProjectService) { }

  @Input() notebook: Notebook;
  @ViewChild('displayNotebookModal') displayNotebookModal: TemplateRef<any>;

  @ViewChild('displayRenameNotebookModal') displayRenameNotebookModal: TemplateRef<any>;
  @ViewChild('displayDatasetsModal') displayDatasetsModal: TemplateRef<any>;

  displayNotebookModalRef: BsModalRef;

  displayRenameNotebookModalRef: BsModalRef;

  displayDatasetsModalRef: BsModalRef;

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
      if (this.versions.length > 0) {
        this.selectedVersion = this.versions[0];
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

  closeRenameNotebookModal() {
    this.displayRenameNotebookModalRef.hide();
  }

  changeNotebookName(notebookName: string) {
    this.notebook.name = notebookName;
  }

  navigateToNotebook() {
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
      this.projectService.deleteNotebook(this.notebook.notebookID, this.selectedVersion, true).subscribe(res => {
      
      })
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
