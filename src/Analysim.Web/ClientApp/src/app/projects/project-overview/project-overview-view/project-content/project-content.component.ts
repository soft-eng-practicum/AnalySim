import { AfterViewInit, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
export class ProjectContentComponent implements OnInit, AfterViewInit {

  constructor(private modalService: BsModalService, private projectService: ProjectService, private router: Router, private route: ActivatedRoute) {
  }

  @ViewChild('uploadNotebookModal') uploadNotebookModal: TemplateRef<any>;
  @ViewChild('folderModal') folderModal: TemplateRef<any>;

  @Input() project: Project

  uploadNotebookModalRef: BsModalRef;
  folderModalRef: BsModalRef;

  @Input() currentUser: User

  @Input() currentDirectory: string

  notebooks: Notebook[] = [];

  validDirectory: boolean = true

  @Input() isMember: boolean

  stackDirectories: string[] = ["notebook/"];

  currentNotebook: Notebook = null;

  notebookID = null;
  version: number = 0;

  isCurrentDirNotebook = false;

  @ViewChild('displayNotebookModal') displayNotebookModal: TemplateRef<any>;

  displayNotebookModalRef: BsModalRef;
  private displayedNotebookModalKey?: string;
  private viewInitialized = false;
  private routeNotebookRequestKey?: string;

  ngOnInit(): void {
    this.currentDirectory = this.extractDirectory(this.router.url);
    this.fetchNotebooks();
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.currentDirectory = this.extractDirectory(ev.url);
        this.fetchNotebooks();
      }
    });

    this.route.queryParams.subscribe((params: Params) => {
      const {
        isNotebook,
        notebookId,
        version
      } = params;
      this.notebookID = notebookId;
      this.version = version;

      if (isNotebook && notebookId) {
        this.routeNotebookRequestKey = `${notebookId}:${version ?? ''}`;
        this.openRouteNotebookWhenReady();
      } else {
        this.routeNotebookRequestKey = undefined;
      }
    })
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.openRouteNotebookWhenReady();
  }

  private openRouteNotebookWhenReady(): void {
    if (!this.viewInitialized || !this.routeNotebookRequestKey) {
      return;
    }

    this.getNotebook();
  }

  getNotebook() {
    if (!this.notebookID) {
      return;
    }

    this.projectService.getNotebook(this.notebookID).subscribe(result => {
      this.currentNotebook = result;
      this.displayNotebook(this.currentNotebook);
    });
  }

  extractDirectory(url) {
    const pathWithoutQuery = url.split("?")[0];
    const query = url.includes("?") ? new URLSearchParams(url.split("?")[1]) : null;
    const segments = pathWithoutQuery.split("/").slice(4).filter(segment => segment.length > 0);

    if (query?.get('isNotebook')) {
      segments.pop();
    }

    return segments.length > 0 ? `${segments.join('/')}/` : '';
  }

  fetchNotebooks() {
    this.isCurrentDirNotebook = this.router.url.includes('isNotebook=true');
    this.getNotebooks(this.currentDirectory);
  }

  displayNotebook(notebook: Notebook) {
    const modalKey = `${notebook?.notebookID ?? ''}:${this.version ?? ''}`;
    if (this.displayNotebookModalRef && this.displayedNotebookModalKey === modalKey) {
      console.warn('[AnalySim Notebook] Ignored duplicate notebook modal open request', {
        notebookId: notebook?.notebookID,
        version: this.version,
      });
      return;
    }

    this.currentNotebook = notebook;
    this.displayedNotebookModalKey = modalKey;
    this.displayNotebookModalRef = this.modalService.show(this.displayNotebookModal, {
      backdrop: 'static',
    });
  }

  toggleModalUpload() {
    this.uploadNotebookModalRef = this.modalService.show(this.uploadNotebookModal);
  }

  closeModal() {
    this.uploadNotebookModalRef.hide();
  }

  closeDisplayNotebookModal() {
    this.displayNotebookModalRef?.hide();
    this.displayNotebookModalRef = undefined;
    this.displayedNotebookModalKey = undefined;
    this.routeNotebookRequestKey = undefined;
    this.navigateToPreviousComponent();
  }

  getNotebooks(directory: string) {
    this.projectService.getNotebooks(this.project.projectID, encodeURIComponent(directory)).subscribe(result => {
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
