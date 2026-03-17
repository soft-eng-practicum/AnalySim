import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Notebook, NotebookFile } from '../../../../../../interfaces/notebook';
import { ProjectService } from '../../../../../../services/project.service';
import { HttpClient } from '@angular/common/http';
import { JupyterLiteStorageService } from '../../../../../../shared/services/jupyter-lite-storage.service';

@Component({
  selector: 'app-project-notebook-item-display',
  templateUrl: './project-notebook-item-display.component.html',
  styleUrls: ['./project-notebook-item-display.component.scss'],
})
export class ProjectNotebookItemDisplayComponent implements OnInit, OnDestroy {

  @Input() notebook: Notebook;
  @Input() version: number;
  @Input() isMember: boolean;
  @Output() closeModal: EventEmitter<any> = new EventEmitter();

  @ViewChild('observablehqPanel', { read: ElementRef }) observablehqPanel: ElementRef;
  @ViewChild('jupyterFrame') jupyterFrame: ElementRef;
  @ViewChild('notebookWindow') notebookWindow: ElementRef;

  jupyterFrameSrc: SafeResourceUrl;
  isLoading = true;
  commitChangesLoading = false;
  showSaveWarningModal = false;
  showSaveNotebookModal = false;
  notebookFile: NotebookFile;

  private static readonly JUPYTER_BASE_PATH = 'assets/jupyter/dist/lab/index.html';

  private timeoutId: any;
  private messageHandler: (event: MessageEvent) => void;

  constructor(
    private projectService: ProjectService,
    private renderer: Renderer2,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private jupyterStorage: JupyterLiteStorageService,
  ) {}

  ngOnInit(): void {
    this.messageHandler = this.receiveMessage.bind(this);
    window.addEventListener('message', this.messageHandler);
    if (this.notebook.type === 'notebook' || this.notebook.type === 'new') {
      this.loadNotebook();
    }
    this.startLoadingTimeout();
  }

  ngAfterViewInit(): void {
    if (this.notebook.type === 'observable') {
      this.isLoading = false;
      this.generateObservableNotebook();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageHandler);
    clearTimeout(this.timeoutId);
  }

  private startLoadingTimeout(): void {
    this.timeoutId = setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.closeModal.emit();
        console.warn('JupyterLite timed out while loading.');
        alert('The notebook took too long to load. Please try opening it again.');
      }
    }, 30000);
  }

  private loadNotebook(): void {
    const notebookFileName = `${this.notebook.name}${this.notebook.extension}`;
    const iframeUrl = `${ProjectNotebookItemDisplayComponent.JUPYTER_BASE_PATH}?path=${encodeURIComponent(notebookFileName)}`;
    this.jupyterFrameSrc = this.sanitizer.bypassSecurityTrustResourceUrl(iframeUrl);

    this.projectService.getNotebookFile(this.notebook, this.version).subscribe({
      next: (nbContent) => {
        const notebookData = this.buildNotebookEntry(notebookFileName, nbContent);
        this.storeNotebook(notebookFileName, notebookData);
        this.storeDatasets();
      },
      error: (err) => console.error('Failed to fetch notebook content:', err),
    });
  }

  private buildNotebookEntry(fileName: string, content: any): object {
    return {
      content,
      name: fileName,
      path: fileName,
      type: 'notebook',
      format: 'json',
      mimetype: 'application/x-ipynb+json',
      size: this.notebook.size,
      writable: true,
      created: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      hash: null,
      hash_algorithm: null,
    };
  }

  private storeNotebook(fileName: string, data: object): void {
    this.jupyterStorage.addFile(fileName, data).then(
      () => console.log(`Notebook written to IndexedDB`),
      (err) => console.error('Failed to write notebook to IndexedDB:', err),
    );
  }

  private storeDatasets(): void {
    const datasets = this.notebook.observableNotebookDatasets;
    if (!datasets?.length) return;
    datasets.forEach((dataset) => {
      this.projectService.downloadCSV(dataset.blobFileID).subscribe({
        next: (data) => {
          const entry = {
            content: data, name: dataset.datasetName, path: dataset.datasetName,
            type: 'file', format: 'text', mimetype: 'text/csv', size: 0,
            writable: true, created: new Date().toISOString(), last_modified: new Date().toISOString(),
          };
          this.jupyterStorage.addFile(dataset.datasetName, entry).then(
            () => {},
            (err) => console.error(`Failed to write dataset:`, err),
          );
        },
        error: (err) => console.error(`Failed to download dataset:`, err),
      });
    });
  }

  receiveMessage(event: MessageEvent): void {
    if (event.data === 'jupyterlite-load') {
      this.isLoading = false;
      clearTimeout(this.timeoutId);
      console.log('JupyterLite signalled ready');
    }
  }

  private generateObservableNotebook(): void {
    const script = this.renderer.createElement('script');
    script.type = 'module';
    script.text = this.buildObservableScript();
    this.renderer.appendChild(this.observablehqPanel.nativeElement, script);
  }

  private buildObservableScript(): string {
    const apiUri = this.notebook.uri.replace('https://', '');
    return `
      import { Runtime, Inspector } from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
      const notebookLink = "https://api.${apiUri}.js?v=3";
      import(notebookLink).then((define) => {
        (new Runtime).module(define.default, name => Inspector.into("#notebook")());
      });
    `;
  }

  saveNotebook(): void { this.showSaveNotebookModal = true; }

  onConfirmSaveNotebook(): void {
    if (this.notebook.type !== 'notebook' && this.notebook.type !== 'new') return;
    this.commitChangesLoading = true;
    const fileName = `${this.notebook.name}${this.notebook.extension}`;
    this.jupyterStorage.getFile(fileName).then(
      (notebookJson) => {
        const blob = new Blob([JSON.stringify(notebookJson.content)], { type: 'application/json' });
        const file = new File([blob], fileName, { type: 'application/json' });
        this.notebookFile = { file, name: this.notebook.name, projectID: this.notebook.projectID };
        this.projectService.uploadNotebookNewVersion(this.notebookFile, this.notebook.directory).subscribe({
          next: () => { this.commitChangesLoading = false; this.showSaveNotebookModal = false; },
          error: (err) => { console.error('Upload failed:', err); this.commitChangesLoading = false; },
        });
      },
      (err) => console.error('Failed to read notebook:', err),
    );
  }

  onCancelSaveNotebook(): void { this.showSaveNotebookModal = false; }

  closeNotebook(): void { this.showSaveWarningModal = true; }

  onConfirmSave(): void {
    clearTimeout(this.timeoutId);
    this.closeModal.emit();
    const fileName = `${this.notebook.name}${this.notebook.extension}`;
    if (this.notebook.type === 'notebook' || this.notebook.type === 'new') {
      this.jupyterStorage.removeFile(fileName).then(
        () => console.log('Notebook removed from IndexedDB'),
        (err) => console.error('Failed to remove notebook:', err),
      );
    }
    const datasets = this.notebook.observableNotebookDatasets;
    if (datasets?.length) {
      datasets.forEach((dataset) => {
        this.jupyterStorage.removeFile(dataset.datasetName).then(
          () => {},
          (err) => console.error(`Failed to remove dataset:`, err),
        );
      });
    }
  }

  onCancelSave(): void { this.showSaveWarningModal = false; }
}
