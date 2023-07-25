import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Project } from 'src/app/interfaces/project';
import { ProjectService } from 'src/app/services/project.service';
import { Notebook } from '../../../../interfaces/notebook';
import { ProjectNotebookItemComponent } from './project-notebook-item/project-notebook-item.component';

@Component({
  selector: 'app-project-content',
  templateUrl: './project-content.component.html',
  styleUrls: ['./project-content.component.scss']
})
export class ProjectContentComponent implements OnInit {

  constructor(private modalService: BsModalService, private projectService: ProjectService) {
   }

   @ViewChild('uploadNotebookModal') uploadNotebookModal : TemplateRef<any>;

   @Input() project : Project

  uploadNotebookModalRef: BsModalRef;

  notebooks: Notebook[];

  ngOnInit(): void {
    this.getNotebooks();
  }

  toggleModalUpload(){
    this.uploadNotebookModalRef = this.modalService.show(this.uploadNotebookModal);
  }

  closeModal() {
    this.uploadNotebookModalRef.hide();
  }

  getNotebooks() {
    this.projectService.getNotebooks(this.project.projectID).subscribe(result => {
      this.notebooks = result;
    });

  }



}
