import { Injectable } from '@angular/core';
import * as localforage from 'localforage';

/**
 * Manages the IndexedDB storage that JupyterLite uses to read and write
 * notebook files and datasets inside the browser.
 *
 * Previously this service existed in two separate places:
 *   - admin/components/notebooks/.../forageIndexDb.ts
 *   - projects/.../localforageIndexdb.ts
 *
 * They were almost identical but used slightly different IndexedDB names,
 * which meant any bug fix had to be applied in two places. This single
 * version replaces both.
 */
@Injectable({
  providedIn: 'root',
})
export class JupyterLiteStorageService {

  private static readonly STORAGE_NAME = 'JupyterLite Storage - /assets/jupyter/dist/';

  private filesStore: LocalForage;
  private checkpointsStore: LocalForage;

  constructor() {
    this.filesStore = localforage.createInstance({
      name: JupyterLiteStorageService.STORAGE_NAME,
      storeName: 'files',
      description: 'Notebook and dataset files for JupyterLite',
    });

    this.checkpointsStore = localforage.createInstance({
      name: JupyterLiteStorageService.STORAGE_NAME,
      storeName: 'checkpoints',
      description: 'Notebook checkpoints for JupyterLite',
    });
  }

  addFile(fileName: string, fileData: any): Promise<any> {
    return this.filesStore.setItem(fileName, fileData);
  }

  getFile(fileName: string): Promise<any> {
    return this.filesStore.getItem(fileName);
  }

  getCheckpoints(fileName: string): Promise<any> {
    return this.checkpointsStore.getItem(fileName);
  }

  removeFile(fileName: string): Promise<any> {
    return this.filesStore.removeItem(fileName);
  }

  getAllFiles(): Promise<Array<{ key: string; value: any }>> {
    const files: Array<{ key: string; value: any }> = [];
    return this.filesStore
      .iterate((value, key) => {
        files.push({ key, value });
      })
      .then(() => files);
  }
}
