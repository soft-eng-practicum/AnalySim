import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Params, Router } from '@angular/router';
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

  constructor(private modalService: BsModalService, private projectService: ProjectService, private router: Router,private route: ActivatedRoute) {
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

  currentNotebook : Notebook = null;

  notebookID = null;

  isCurrentDirNotebook = false;

  @ViewChild('displayNotebookModal') displayNotebookModal: TemplateRef<any>;

  displayNotebookModalRef: BsModalRef;

  ngOnInit(): void {
    this.currentDirectory = this.extractDirectory(this.router.url);
    this.fetchNotebooks();
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.currentDirectory = this.extractDirectory(ev.url);
        this.fetchNotebooks();
      }
    });

    this.route.queryParams.subscribe((params: Params)=>{
      const {
        isNotebook,
        notebookId 
      } = params;
      this.notebookID = notebookId;
    })
    if(this.isCurrentDirNotebook)
    this.getNotebook();
  }

  getNotebook(){
    this.projectService.getNotebook(this.notebookID).subscribe(result => {
      this.currentNotebook = result;
      this.displayNotebook(this.currentNotebook);
    });
  }

  extractDirectory(url){
    return url.split("/").slice(4).join('/')+'/';
  }

  fetchNotebooks(){
    if(!this.currentDirectory.includes("?"))
    {
    this.getNotebooks(this.currentDirectory);
    this.isCurrentDirNotebook = false;
    }
    else
    {
    this.currentDirectory=this.currentDirectory.split("?")[0];
    this.getNotebooks(this.currentDirectory);
    this.isCurrentDirNotebook = true;
    }
  }

  displayNotebook(notebook : Notebook){
    this.currentNotebook = notebook;
    console.log(this.currentNotebook);
    this.displayNotebookModalRef = this.modalService.show(this.displayNotebookModal,{
      backdrop: 'static',
    });
  }

  toggleModalUpload(){
    this.uploadNotebookModalRef = this.modalService.show(this.uploadNotebookModal);
  }

  closeModal() {
    this.uploadNotebookModalRef.hide();
  }

  closeDisplayNotebookModal(){
    this.displayNotebookModalRef.hide();
    this.navigateToPreviousComponent();
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
