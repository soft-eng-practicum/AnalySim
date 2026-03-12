import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Notebook, NotebookFile } from '../../../../../../interfaces/notebook';
import { ProjectService } from '../../../../../../services/project.service';
import { HttpClient } from '@angular/common/http';
import { JupyterLiteStorageService } from '../forageIndexDb';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-notebook-item-display',
  templateUrl: './admin-notebook-item-display.component.html',
  styleUrls: ['./admin-notebook-item-display.component.scss']
})
export class AdminNotebookItemDisplayComponent {


  @Input() notebook: Notebook;
  @Input() version: number;

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  showSaveWarningModal = false;
  showSaveNotebookModal = false;

  constructor(private projectService: ProjectService, private _renderer2: Renderer2, private http: HttpClient
    , private sanitizer: DomSanitizer, private jupyterLiteStorageService: JupyterLiteStorageService
  ) { }

  @ViewChild('observablehqPanel', { read: ElementRef }) observablehqPanel;
  @ViewChild('jupyterFrame') jupyterFrame: ElementRef;
  @ViewChild('notebookWindow') notebookWindow: ElementRef;
  jupyterFrameSrc: SafeResourceUrl;
  isLoading = true;
  timeoutId: any;
  notebookFile: NotebookFile;
  commitChangesLoading = false;

  ngOnInit(): void {
    window.addEventListener('message', this.receiveMessage.bind(this));
    if (this.notebook.type === 'notebook' || this.notebook.type === 'new') {
      this.loadNotebook();
    }
    this.setTimeoutForLoading();
  }

  ngAfterViewInit(): void {
    if (this.notebook.type === 'observable') {
      this.isLoading = false;
      this.generateObservableNotebook();
    }
  }

  setTimeoutForLoading(): void {
    this.timeoutId = setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.closeModal.emit();
        console.log("some unknown error occurred , please open the notebook again.");
        alert("some unknown error occurred , please open the notebook again.");
      }
    }, 30000);
  }

  loadNotebook() {
    const url = `../../../../../../../assets/jupyter/dist/lab/index.html?path=${this.notebook.name}${this.notebook.extension}`;
    this.jupyterFrameSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);

    this.projectService.getNotebookFile(this.notebook, this.version)
      .subscribe(nbContent => {
        const notebookName = `${this.notebook.name}${this.notebook.extension}`;
        const notebookData = {
          content: nbContent, // The content of the notebook
          created: new Date().toISOString(),
          format: "json",
          hash: null,
          hash_algorithm: null,
          last_modified: new Date().toISOString(),
          mimetype: 'application/x-ipynb+json',
          name: notebookName,
          size: this.notebook.size,
          path: notebookName,
          type: 'notebook',
          writable: true,
        };

        // Fetch and add datasets of the notebook
        let datasets = this.notebook.observableNotebookDatasets;
        if (datasets) {
          datasets.forEach(dataset => {
            this.projectService.downloadCSV(dataset.blobFileID).subscribe(data => {
              const datasetName = dataset.datasetName;
              const datasetData = {
                content: data, // The content of the dataset
                created: new Date().toISOString(),
                format: "text",
                last_modified: new Date().toISOString(),
                mimetype: 'text/csv',
                name: datasetName,
                path: datasetName,
                size: 0,
                type: 'file',
                writable: true,
              }

              this.jupyterLiteStorageService.addFile(datasetName, datasetData).then(
                () => {
                },
                (error) => {
                  console.error('Error adding dataset:', error);
                }
              );
            });
          });
        }

        // Add the notebook
        this.jupyterLiteStorageService.addFile(notebookName, notebookData).then(
          () => {
            console.log('File added successfully');
          },
          (error) => {
            console.error('Error adding file:', error);
          }
        );
      });
  }

  receiveMessage(event: MessageEvent): void {
    if (event.data === 'jupyterlite-load') {
      this.isLoading = false;
      clearTimeout(this.timeoutId);
      console.log('Notebook loaded successfully');
    }
  }

  generateObservableNotebook() {

    let script = this._renderer2.createElement('script');
    script.type = `module`;
    script.text = this.generateScript;
    this._renderer2.appendChild(this.observablehqPanel.nativeElement, script);
  }

  get generateScript(): String {
    return ` import {Runtime, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
    var notebookLink = "https://api.` + this.notebook.uri.replace("https://", "") + `.js?v=3";
    import(notebookLink).then((define) =>{
        var notebook = define.default;
        (new Runtime).module(notebook, name =>{
            return Inspector.into("#notebook")();
        });
    });`
  }

  saveNotebook() {
    this.showSaveNotebookModal = true;
  }

  onConfirmSaveNotebook() {
    if (this.notebook.type === 'notebook' || this.notebook.type === 'new') {
      this.commitChangesLoading = true;
      this.jupyterLiteStorageService.getFile(`${this.notebook.name}${this.notebook.extension}`).then(
        (notebookJson) => {
          const notebookBlob = new Blob([JSON.stringify(notebookJson.content)], { type: 'application/json' });
          const file = new File([notebookBlob], `${this.notebook.name}${this.notebook.extension}`, { type: 'application/json' });
          this.notebookFile = {
            'file': file,
            'name': `${this.notebook.name}`,
            'projectID': this.notebook.projectID,
          }
          this.projectService.uploadNotebookNewVersion(this.notebookFile, this.notebook.directory).subscribe(result => {
            this.commitChangesLoading = false;
            this.showSaveNotebookModal = false;
          });
        },
        (error) => {
          console.error('Error getting file:', error);
        }
      );
    }
  }

  onCancelSaveNotebook() {
    this.showSaveNotebookModal = false;
  }

  closeNotebook() {
    this.showSaveWarningModal = true;
  }

  onConfirmSave() {
    clearTimeout(this.timeoutId);
    this.closeModal.emit();
    if (this.notebook.type === 'notebook' || this.notebook.type === 'new') {
      this.jupyterLiteStorageService.getFile(`${this.notebook.name}${this.notebook.extension}`).then(
        (file) => {
          console.log('File:', file);
        },
        (error) => {
          console.error('Error getting file:', error);
        }
      );
      this.jupyterLiteStorageService.removeFile(`${this.notebook.name}${this.notebook.extension}`).then(
        () => {
          console.log('File removed successfully');
        },
        (error) => {
          console.error('Error removing file:', error);
        }
      );
    }

    let datasets = this.notebook.observableNotebookDatasets;
    if (datasets) {
      datasets.forEach(dataset => {
        this.jupyterLiteStorageService.removeFile(dataset.datasetName).then(
          () => {
            console.log(`Dataset ${dataset.datasetName} removed successfully`);
          },
          (error) => {
            console.error('Error removing dataset:', error);
          }
        );
      });
    }
  }

  onCancelSave() {
    this.showSaveWarningModal = false;
  }
}
