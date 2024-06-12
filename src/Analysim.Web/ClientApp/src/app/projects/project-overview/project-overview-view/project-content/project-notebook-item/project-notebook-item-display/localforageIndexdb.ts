import { Injectable } from '@angular/core';
import * as localforage from 'localforage';

@Injectable({
    providedIn: 'root',
})
export class JupyterLiteStorageService {
    private filesStore: LocalForage;
    private checkpointsStore: LocalForage;

    constructor() {
        this.filesStore = localforage.createInstance({
            name: 'JupyterLite Storage',
            storeName: 'files', // Object store name
            description: 'Storage for JupyterLite files',
        });
        this.checkpointsStore = localforage.createInstance({
            name: 'JupyterLite Storage',
            storeName: 'checkpoints', // Object store name
            description: 'Storage for JupyterLite checkpoints',
        });
    }

    // Add a file to the IndexedDB
    addFile(fileName: string, fileData: any): Promise<any> {
        return this.filesStore.setItem(fileName, fileData);
    }

    // Get a file by its name
    getFile(fileName: string): Promise<any> {
        return this.filesStore.getItem(fileName);
    }

    getCheckpoints(fileName: string): Promise<any> {
        return this.checkpointsStore.getItem(fileName);
    }

    removeFile(fileName: string): Promise<any> {
        this.checkpointsStore.removeItem(fileName);
        return this.filesStore.removeItem(fileName);
    }

    // Get all files
    getAllFiles(): Promise<any[]> {
        const files: any[] = [];
        return this.filesStore.iterate((value, key) => {
            files.push({ key, value });
        }).then(() => files);
    }
}
