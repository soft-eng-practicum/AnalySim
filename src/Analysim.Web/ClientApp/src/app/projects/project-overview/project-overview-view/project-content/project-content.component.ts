import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Project } from 'src/app/interfaces/project';

@Component({
  selector: 'app-project-content',
  templateUrl: './project-content.component.html',
  styleUrls: ['./project-content.component.scss']
})
export class ProjectContentComponent implements OnInit {

  constructor(private modalService : BsModalService) {
   }

   @ViewChild('uploadNotebookModal') uploadNotebookModal : TemplateRef<any>;

   @Input() project : Project

   uploadNotebookModalRef : BsModalRef;

  ngOnInit(): void {
  }

  toggleModalUpload(){
    this.uploadNotebookModalRef = this.modalService.show(this.uploadNotebookModal);
  }



}
