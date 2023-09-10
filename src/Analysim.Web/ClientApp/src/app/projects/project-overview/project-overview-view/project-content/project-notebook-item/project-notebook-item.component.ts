import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Notebook } from '../../../../../interfaces/notebook';
import { ProjectService } from '../../../../../services/project.service';

@Component({
  selector: 'app-project-notebook-item',
  templateUrl: './project-notebook-item.component.html',
  styleUrls: ['./project-notebook-item.component.scss']
})
export class ProjectNotebookItemComponent implements OnInit {

  constructor(private modalService: BsModalService, private router: Router, private projectService: ProjectService) { }


  @Input() notebook: Notebook;
  @ViewChild('displayNotebookModal') displayNotebookModal: TemplateRef<any>;

  @ViewChild('displayRenameNotebookModal') displayRenameNotebookModal: TemplateRef<any>;

  @Input() currentDirectory: string;

  @Output() navigateToNewDirectory: EventEmitter<string> = new EventEmitter<string>();


  displayNotebookModalRef: BsModalRef;

  displayRenameNotebookModalRef: BsModalRef;

  @Output() getNotebooks: EventEmitter<string> = new EventEmitter<string>();

  @Output() setCurrentNotebook : EventEmitter<Notebook> = new EventEmitter<Notebook>();

  ngOnInit(): void {
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

  navigate() {
    this.router.navigate([this.router.url+"/"+this.notebook.name]);
  }

  changeNotebookName(notebookName: string){
    this.notebook.name = notebookName;
  }

  navigateToNotebook(){
    this.setCurrentNotebook.emit(this.notebook);
    let datasetParams ={};
    if(this.notebook.type==="observable")
    {
      this.notebook.observableNotebookDatasets.forEach(observableNotebook=>{
        datasetParams[observableNotebook.datasetName] = observableNotebook.datasetURL;
      })
    }
    this.router.navigate([this.router.url+"/"+this.notebook.name],{queryParams:{
      isNotebook: true,
      notebookId: this.notebook.notebookID,
      ...datasetParams
    },queryParamsHandling: 'merge'});
  }

  deleteNotebook() {
    this.projectService.deleteNotebook(this.notebook.notebookID).subscribe(res => {
      this.getNotebooks.emit(this.currentDirectory);
    })
  }

  downloadNotebook() {
    this.projectService.downloadNotebook(this.notebook).subscribe(res => {
      let url = window.URL.createObjectURL(res);
      let a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = this.notebook.name + this.notebook.extension;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    })
  }

  goBack() {
    console.log("Go Back");
  }

}
