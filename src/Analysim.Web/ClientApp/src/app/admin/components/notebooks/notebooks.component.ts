import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Notebook } from 'src/app/interfaces/notebook';
import { ProjectService } from 'src/app/services/project.service';
import { Params, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-notebooks',
  templateUrl: './notebooks.component.html',
  styleUrls: ['./notebooks.component.scss']
})
export class NotebooksComponent implements OnInit {
  notebooks: Notebook[] = [];
  loading = false;
  error: string | null = null;
  notebookID = null;
  version: number = 0;
  currentNotebook: Notebook = null;
  currentProjectName: string;

  constructor(private modalService: BsModalService, private projectService: ProjectService, private router: Router, private route: ActivatedRoute) { }
  
  @ViewChild('displayNotebookModal') displayNotebookModal: TemplateRef<any>;
  
  displayNotebookModalRef: BsModalRef;

  ngOnInit(): void {
    this.loadNotebooks();
    this.router.events.subscribe((ev) => {
          if (ev instanceof NavigationEnd) {
            this.loadNotebooks();
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
        })
    this.getNotebook();
  }

  getNotebook() {
    this.projectService.getNotebook(this.notebookID).subscribe(result => {
      this.currentNotebook = result;
      this.displayNotebook(this.currentNotebook);
    });
  }

  displayNotebook(notebook: Notebook) {
    this.currentNotebook = notebook;
    this.currentProjectName = notebook.route;
    this.projectService.getProjectByID(notebook.projectID).subscribe({
      next: project => {
        this.currentProjectName = project?.name || this.currentProjectName;
        this.showDisplayNotebookModal();
      },
      error: error => {
        console.error('Error loading project name for JupyterLite scope:', error);
        this.showDisplayNotebookModal();
      }
    });
  }

  private showDisplayNotebookModal() {
    this.displayNotebookModalRef = this.modalService.show(this.displayNotebookModal, {
      backdrop: 'static',
    });
  }

  closeDisplayNotebookModal() {
    this.displayNotebookModalRef.hide();
    this.navigateToPreviousComponent();
  }

  navigateToPreviousComponent() {
    let previousDirectory = this.router.url.split('/');
    previousDirectory.pop();
    this.router.navigate([previousDirectory.join('/')])
  }

  loadNotebooks() {
    this.loading = true;
    this.error = null;
    this.projectService.getAllNotebooks().subscribe({
      next: nbs => {
        this.notebooks = nbs.filter(nb => nb.type !== 'folder');
        this.loading = false;
      },
      error: err => {
        this.error = err.message || 'Failed to load notebooks';
        this.loading = false;
      }
    });
  }
}
