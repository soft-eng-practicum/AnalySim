import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Notebook, NotebookFile } from '../../../../../../interfaces/notebook';
import { ProjectService } from '../../../../../../services/project.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { JupyterLiteBridgeService } from '../../../../../../services/jupyter-lite-bridge.service';
import { firstValueFrom } from 'rxjs';

type CommitResult = {
  saved: number;
  skipped: number;
  tracked: number;
};

type PendingCommitAction = 'manual' | 'close';

type SaveTrackedFilesResult = {
  saved: string[];
  failed: { path: string; message: string }[];
};

@Component({
  selector: 'app-project-notebook-item-display',
  templateUrl: './project-notebook-item-display.component.html',
  styleUrls: ['./project-notebook-item-display.component.scss']
})
export class ProjectNotebookItemDisplayComponent implements OnInit, OnDestroy {


  @Input() notebook: Notebook;
  @Input() version: number;
  @Input() isMember: boolean;
  @Input() projectName?: string;

  @Output() closeModal: EventEmitter<any> = new EventEmitter();

  constructor(private projectService: ProjectService, private _renderer2: Renderer2
    , private sanitizer: DomSanitizer, private jupyterLiteBridgeService: JupyterLiteBridgeService
  ) { }

  @ViewChild('observablehqPanel', { read: ElementRef }) observablehqPanel;
  @ViewChild('jupyterFrame') jupyterFrame: ElementRef;
  @ViewChild('notebookWindow') notebookWindow: ElementRef;
  jupyterFrameSrc: SafeResourceUrl;
  isLoading = true;
  timeoutId: any;
  commitChangesLoading = false;
  commitStatusMessage = '';
  autoCommitAfterClose = true;
  unsavedCommitWarningVisible = false;
  unsavedCommitWarningFiles: string[] = [];
  private readonly messageHandler = this.receiveMessage.bind(this);
  private commitPromise?: Promise<CommitResult>;
  private latestSavedFileHashes = new Map<string, string>();
  private pendingCommitAction?: PendingCommitAction;
  private autoCommitHandledForClose = false;
  private bridgeConnected = false;

  ngOnInit(): void {
    window.addEventListener('message', this.messageHandler);
    this.autoCommitAfterClose = this.loadAutoCommitAfterClosePreference();
    if (this.isJupyterLiteNotebook()) {
      this.loadNotebook();
    }
    this.setTimeoutForLoading();
  }

  ngAfterViewInit(): void {
    if (this.isJupyterLiteNotebook() && !this.bridgeConnected) {
      this.bridgeConnected = true;
      this.jupyterLiteBridgeService.connect(this.jupyterFrame, this.notebook.projectID, this.projectName);
    }

    if (this.notebook.type === 'observable') {
      this.isLoading = false;
      this.generateObservableNotebook();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageHandler);
    if (!this.autoCommitHandledForClose && this.canAutoCommitOnDestroy()) {
      void this.saveAndCommitTrackedFilesOnDestroy()
        .finally(() => this.jupyterLiteBridgeService.disconnect());
      return;
    }
    this.jupyterLiteBridgeService.disconnect();
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
    const url = '/assets/jupyter/dist/lab/index.html';
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
              // console.log("dataset content during fetching : ", data);
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

              this.jupyterLiteBridgeService.addFile(datasetName, datasetData).then(
                () => {
                },
                (error) => {
                  console.error('Error adding dataset:', error);
                }
              );
            });
          });
        }

        // Angular intentionally does not open JupyterLite IndexedDB/localForage.
        // The frontend extension owns all Jupyter contents access through the official contents API.
        this.jupyterLiteBridgeService.addFile(notebookName, notebookData, true, true).then(
          (savedModel) => {
            this.rememberTrackedFileHash(notebookName, savedModel || notebookData);
            console.log('File added successfully');
          },
          (error) => {
            console.error('Error adding file:', error);
          }
        );
      });
  }

  receiveMessage(event: MessageEvent): void {
    if (event.data?.source === 'analysim-jupyterlite' && event.data?.type === 'analysim:jupyterlite-ready') {
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

  async closeNotebook() {
    clearTimeout(this.timeoutId);
    if (this.canCommitTrackedFiles() && this.autoCommitAfterClose) {
      if (!await this.saveTrackedFilesBeforeCommit('close')) {
        return;
      }

      await this.runAutoCommitOnClose();
      this.autoCommitHandledForClose = true;
    }
    this.closeModal.emit();
  }

  async commitTrackedFiles(): Promise<void> {
    if (!this.canCommitTrackedFiles()) {
      return;
    }

    if (!await this.saveTrackedFilesBeforeCommit('manual')) {
      return;
    }

    await this.runManualCommit();
  }

  async continueCommitWithUnsavedFiles(): Promise<void> {
    const action = this.pendingCommitAction;
    this.clearUnsavedCommitWarning();

    if (action === 'manual') {
      await this.runManualCommit();
      return;
    }

    if (action === 'close') {
      await this.runAutoCommitOnClose();
      this.autoCommitHandledForClose = true;
      this.closeModal.emit();
    }
  }

  dismissUnsavedCommitWarning(): void {
    this.clearUnsavedCommitWarning();
    this.commitStatusMessage = 'Commit paused. Save the listed files in JupyterLite, then commit again.';
  }

  onAutoCommitAfterCloseChange(value: boolean): void {
    this.autoCommitAfterClose = value;
    localStorage.setItem(this.getAutoCommitAfterCloseKey(), JSON.stringify(value));
  }

  private async runManualCommit(): Promise<void> {
    this.commitChangesLoading = true;
    this.commitStatusMessage = '';
    try {
      const result = await this.commitChangedTrackedFilesToBackend();
      this.commitStatusMessage = result.saved > 0
        ? `Committed ${result.saved} changed file${result.saved === 1 ? '' : 's'}.`
        : 'No tracked file changes to commit.';
    } catch (error) {
      this.commitStatusMessage = 'Commit failed. Please try again.';
      console.error('Error committing tracked JupyterLite files:', error);
    } finally {
      this.commitChangesLoading = false;
    }
  }

  private async runAutoCommitOnClose(): Promise<void> {
    try {
      await this.commitChangedTrackedFilesToBackend();
    } catch (error) {
      console.error('Error committing tracked JupyterLite files on close:', error);
    }
  }

  private async saveAndCommitTrackedFilesOnDestroy(): Promise<void> {
    const saved = await this.saveTrackedFilesBeforeCommit('close', false);
    if (!saved) {
      console.warn('Skipping tracked JupyterLite backend commit on destroy because auto-save failed.');
      return;
    }

    try {
      await this.commitChangedTrackedFilesToBackend();
    } catch (error) {
      console.error('Error committing tracked JupyterLite files on destroy:', error);
    }
  }

  private async saveTrackedFilesBeforeCommit(action: PendingCommitAction, showWarning = true): Promise<boolean> {
    try {
      const result: SaveTrackedFilesResult = await this.jupyterLiteBridgeService.saveTrackedFiles();
      if (result.saved.length > 0) {
        console.log('Saved tracked JupyterLite files before commit:', result.saved);
      }

      if (result.failed.length === 0) {
        return true;
      }

      if (showWarning) {
        this.unsavedCommitWarningFiles = result.failed.map(item => item.path);
        this.pendingCommitAction = action;
        this.unsavedCommitWarningVisible = true;
        this.commitStatusMessage = 'Some tracked files could not be saved automatically. Save them in JupyterLite, then commit again.';
      }
      return false;
    } catch (error) {
      console.warn('Unable to auto-save tracked JupyterLite files before commit:', error);
      return true;
    }
  }

  private clearUnsavedCommitWarning(): void {
    this.unsavedCommitWarningVisible = false;
    this.unsavedCommitWarningFiles = [];
    this.pendingCommitAction = undefined;
  }

  private async commitChangedTrackedFilesToBackend(): Promise<CommitResult> {
    if (!this.commitPromise) {
      this.commitPromise = this.saveChangedTrackedFilesToBackend()
        .finally(() => {
          this.commitPromise = undefined;
        });
    }

    return this.commitPromise;
  }

  private async saveChangedTrackedFilesToBackend(): Promise<CommitResult> {
    const trackedPaths = await this.jupyterLiteBridgeService.getTrackedFileNames();
    const uniquePaths = Array.from(new Set(trackedPaths));
    const result: CommitResult = {
      saved: 0,
      skipped: 0,
      tracked: uniquePaths.length,
    };

    for (const path of uniquePaths) {
      const model = await this.jupyterLiteBridgeService.getFile(path);
      const currentHash = this.getContentsHash(model);
      if (this.latestSavedFileHashes.get(path) === currentHash) {
        result.skipped++;
        console.log(`Tracked JupyterLite file unchanged; skipping backend save: ${path}`);
        continue;
      }

      const file = this.createFileFromContentsModel(path, model);

      if (path.toLowerCase().endsWith('.ipynb')) {
        const notebookName = this.getBaseName(path).replace(/\.ipynb$/i, '');
        const notebookPayload: NotebookFile = {
          file,
          name: notebookName,
          projectID: this.notebook.projectID,
        };

        try {
          await firstValueFrom(this.projectService.uploadNotebookNewVersion(notebookPayload, this.notebook.directory));
        } catch {
          await firstValueFrom(this.projectService.uploadNotebook(notebookPayload, this.notebook.directory));
        }
      } else {
        await firstValueFrom(this.projectService.uploadFile(file, this.notebook.directory, 0, this.notebook.projectID));
      }

      this.latestSavedFileHashes.set(path, currentHash);
      result.saved++;
    }

    return result;
  }

  private rememberTrackedFileHash(path: string, model: any): void {
    this.latestSavedFileHashes.set(path, this.getContentsHash(model));
  }

  private getContentsHash(model: any): string {
    return this.hashString(this.stableStringify(model?.content));
  }

  private hashString(value: string): string {
    let hash = 0;
    for (let index = 0; index < value.length; index++) {
      hash = ((hash << 5) - hash) + value.charCodeAt(index);
      hash |= 0;
    }
    return hash.toString(16);
  }

  private stableStringify(value: any): string {
    if (value === null || typeof value !== 'object') {
      return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
      return `[${value.map(item => this.stableStringify(item)).join(',')}]`;
    }

    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${this.stableStringify(value[key])}`).join(',')}}`;
  }

  private createFileFromContentsModel(path: string, model: any): File {
    const fileName = this.getBaseName(path);
    const content = model?.content;

    if (model?.format === 'base64') {
      const binary = atob(content || '');
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index++) {
        bytes[index] = binary.charCodeAt(index);
      }
      return new File([bytes], fileName, { type: model?.mimetype || 'application/octet-stream' });
    }

    const body = model?.format === 'json' && typeof content !== 'string'
      ? JSON.stringify(content)
      : (content || '');
    return new File([body], fileName, { type: model?.mimetype || 'text/plain' });
  }

  private getBaseName(path: string): string {
    return path.split('/').filter(Boolean).pop() || path;
  }

  private isJupyterLiteNotebook(): boolean {
    return this.notebook?.type === 'new';
  }

  private canCommitTrackedFiles(): boolean {
    return this.isJupyterLiteNotebook() && this.isMember;
  }

  private canAutoCommitOnDestroy(): boolean {
    return this.canCommitTrackedFiles() && this.autoCommitAfterClose;
  }

  private loadAutoCommitAfterClosePreference(): boolean {
    const raw = localStorage.getItem(this.getAutoCommitAfterCloseKey());
    return raw === null ? true : raw === 'true';
  }

  private getAutoCommitAfterCloseKey(): string {
    return `analysim:auto-commit-after-close:${this.getProjectScopeSlug()}`;
  }

  private getProjectScopeSlug(): string {
    const scope = this.projectName || this.notebook?.projectID || 'default';
    return String(scope)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'default';
  }
}
