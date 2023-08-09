import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Project } from 'src/app/interfaces/project';
import { ProjectService } from 'src/app/services/project.service';
import { Notebook } from '../../../../interfaces/notebook';
import { User } from '../../../../interfaces/user';
import { ProjectNotebookItemComponent } from './project-notebook-item/project-notebook-item.component';

@Component({
  selector: 'app-project-content',
  templateUrl: './project-content.component.html',
  styleUrls: ['./project-content.component.scss']
})
export class ProjectContentComponent implements OnInit {

  constructor(private modalService: BsModalService, private projectService: ProjectService, private router: Router) {
   }

  @ViewChild('uploadNotebookModal') uploadNotebookModal: TemplateRef<any>;
  @ViewChild('folderModal') folderModal: TemplateRef<any>;

   @Input() project : Project

  uploadNotebookModalRef: BsModalRef;
  folderModalRef: BsModalRef;

  @Input() currentUser: User

  @Input() currentDirectory: string

  notebooks: Notebook[];

  validDirectory: boolean = true

  @Input() isMember: boolean

  stackDirectories: string[] = ["notebook/"];

  ngOnInit(): void {
    this.getNotebooks(this.currentDirectory);
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.currentDirectory = ev.url.split("/").slice(4).join('/');
        console.log(this.currentDirectory);
        this.getNotebooks(this.currentDirectory+"/");

      }
   
    });
  }

  toggleModalUpload(){
    this.uploadNotebookModalRef = this.modalService.show(this.uploadNotebookModal);
  }

  closeModal() {
    this.uploadNotebookModalRef.hide();
  }

  getNotebooks(directory: string) {
    this.projectService.getNotebooks(this.project.projectID,encodeURIComponent(directory)).subscribe(result => {
      this.notebooks = result;
    });

  }

  openFolderModal() {
      this.folderModalRef = this.modalService.show(this.folderModal)
  }

  closeFolderModal() {
    this.folderModalRef.hide();
  }

  navigate(directory: string) {
    this.getNotebooks(directory);
  }

  navigateToPreviousComponent() {
    let previousDirectory = this.router.url.split('/');
    previousDirectory.pop();
    this.router.navigate([previousDirectory.join('/')])
  }


}
