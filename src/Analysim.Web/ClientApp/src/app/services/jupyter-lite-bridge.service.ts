import { ElementRef, Injectable } from '@angular/core';

export type AnalysimJupyterRequestType =
  | 'analysim:init'
  | 'analysim:add-file'
  | 'analysim:get-file'
  | 'analysim:get-all-files'
  | 'analysim:get-file-names'
  | 'analysim:get-checkpoints'
  | 'analysim:get-tracked-file-names'
  | 'analysim:get-unsaved-file-names'
  | 'analysim:save-tracked-files'
  | 'analysim:track-file'
  | 'analysim:untrack-file'
  | 'analysim:set-tracked-files';

type AnalysimJupyterResponse = {
  source: 'analysim-jupyterlite';
  type: 'analysim:response';
  requestId: string;
  ok: boolean;
  data?: any;
  error?: {
    message: string;
    stack?: string;
  };
};

type AnalysimJupyterEvent = {
  source: 'analysim-jupyterlite';
  type:
    | 'analysim:jupyterlite-ready'
    | 'analysim:tracked-files-changed'
    | 'analysim:file-changed';
  projectId?: string | number;
  projectName?: string | number;
  data?: any;
};

type PendingRequest = {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timeoutId: any;
};

@Injectable({
  providedIn: 'root',
})
export class JupyterLiteBridgeService {
  private readonly requestTimeoutMs = 30000;
  private iframeWindow?: Window;
  private iframeOrigin?: string;
  private projectId?: string | number;
  private projectName?: string | number;
  private pendingRequests = new Map<string, PendingRequest>();
  private readyResolver?: () => void;
  private initializedResolver?: () => void;
  private readyPromise: Promise<void> = Promise.resolve();
  private initializedPromise: Promise<void> = Promise.resolve();
  private isReady = false;
  private isInitialized = false;

  constructor() {
    window.addEventListener('message', this.receiveMessage);
  }

  connect(iframe: ElementRef<HTMLIFrameElement> | HTMLIFrameElement, projectId: string | number, projectName?: string | number): void {
    const iframeElement = iframe instanceof ElementRef ? iframe.nativeElement : iframe;
    this.iframeWindow = iframeElement.contentWindow;
    this.iframeOrigin = this.getOrigin(iframeElement.src);
    this.projectId = projectId;
    this.projectName = projectName;
    this.log('connected to iframe', { iframeOrigin: this.iframeOrigin, projectId, projectName });
    this.isReady = false;
    this.isInitialized = false;
    this.readyPromise = new Promise(resolve => this.readyResolver = resolve);
    this.initializedPromise = new Promise(resolve => this.initializedResolver = resolve);
  }

  disconnect(): void {
    this.log('disconnecting iframe bridge', { pendingRequestCount: this.pendingRequests.size });
    this.iframeWindow = undefined;
    this.iframeOrigin = undefined;
    this.projectId = undefined;
    this.projectName = undefined;
    this.isReady = false;
    this.isInitialized = false;
    this.pendingRequests.forEach(request => {
      clearTimeout(request.timeoutId);
      request.reject(new Error('JupyterLite iframe was disconnected.'));
    });
    this.pendingRequests.clear();
  }

  waitUntilReady(): Promise<void> {
    return this.readyPromise;
  }

  addFile(path: string, model: any, open = false, track = false): Promise<any> {
    return this.sendRequest('analysim:add-file', { path, model, open, track });
  }

  getFile(path: string): Promise<any> {
    return this.sendRequest('analysim:get-file', { path });
  }

  getAllFiles(): Promise<any[]> {
    return this.sendRequest('analysim:get-all-files');
  }

  getFileNames(): Promise<string[]> {
    return this.sendRequest('analysim:get-file-names');
  }

  getCheckpoints(path: string): Promise<any[]> {
    return this.sendRequest('analysim:get-checkpoints', { path });
  }

  getTrackedFileNames(): Promise<string[]> {
    return this.sendRequest('analysim:get-tracked-file-names');
  }

  getUnsavedFileNames(): Promise<string[]> {
    return this.sendRequest('analysim:get-unsaved-file-names');
  }

  saveTrackedFiles(): Promise<{ saved: string[]; failed: { path: string; message: string }[] }> {
    return this.sendRequest('analysim:save-tracked-files');
  }

  trackFile(path: string): Promise<string[]> {
    return this.sendRequest('analysim:track-file', { path });
  }

  untrackFile(path: string): Promise<string[]> {
    return this.sendRequest('analysim:untrack-file', { path });
  }

  setTrackedFiles(paths: string[]): Promise<string[]> {
    return this.sendRequest('analysim:set-tracked-files', { paths });
  }

  private async sendRequest(type: AnalysimJupyterRequestType, payload?: any): Promise<any> {
    const targetWindow = this.iframeWindow;
    if (!targetWindow) {
      throw new Error('JupyterLite iframe is not connected.');
    }

    if (type !== 'analysim:init') {
      await this.initializedPromise;
    }

    const requestId = this.createRequestId();
    const request = {
      source: 'analysim-angular',
      type,
      requestId,
      projectId: this.projectId,
      payload,
    };
    this.log('sending request', this.sanitizeRequestForLog(request));

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        this.log('request timed out', { type, requestId });
        reject(new Error(`JupyterLite request timed out: ${type}`));
      }, this.requestTimeoutMs);

      this.pendingRequests.set(requestId, { resolve, reject, timeoutId });
      targetWindow.postMessage(request, this.iframeOrigin || window.location.origin);
    });
  }

  private receiveMessage = (event: MessageEvent): void => {
    if (this.iframeWindow && event.source !== this.iframeWindow) {
      return;
    }

    if (this.iframeOrigin && event.origin !== this.iframeOrigin) {
      return;
    }

    const message = event.data as AnalysimJupyterResponse | AnalysimJupyterEvent;
    if (!message || message.source !== 'analysim-jupyterlite') {
      return;
    }

    if (message.type === 'analysim:jupyterlite-ready') {
      this.log('received ready event', { projectId: message.projectId, projectName: message.projectName });
      this.isReady = true;
      this.readyResolver?.();
      this.initializeJupyterLite().catch(error => console.error('Error initializing JupyterLite bridge:', error));
      return;
    }

    if (message.type !== 'analysim:response') {
      return;
    }

    const pending = this.pendingRequests.get(message.requestId);
    if (!pending) {
      this.log('received response for unknown request', { requestId: message.requestId, ok: message.ok });
      return;
    }

    clearTimeout(pending.timeoutId);
    this.pendingRequests.delete(message.requestId);

    if (message.ok) {
      this.log('request succeeded', { requestId: message.requestId });
      pending.resolve(message.data);
    } else {
      this.log('request failed', { requestId: message.requestId, error: message.error?.message });
      pending.reject(new Error(message.error?.message || 'JupyterLite request failed.'));
    }
  };

  private async initializeJupyterLite(): Promise<void> {
    if (!this.isReady || this.isInitialized) {
      return;
    }

    await this.sendRequest('analysim:init', {
      projectId: this.projectId,
      projectName: this.projectName,
      allowedOrigin: window.location.origin,
    });
    this.isInitialized = true;
    this.log('initialized JupyterLite project bridge', { projectId: this.projectId, projectName: this.projectName });
    this.initializedResolver?.();
  }

  private getOrigin(src: string): string {
    try {
      return new URL(src, window.location.href).origin;
    } catch {
      return window.location.origin;
    }
  }

  private createRequestId(): string {
    return `analysim-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private sanitizeRequestForLog(request: any): any {
    return {
      type: request.type,
      requestId: request.requestId,
      projectId: request.projectId,
      projectName: request.payload?.projectName,
      payloadPath: request.payload?.path,
      payloadPathsCount: Array.isArray(request.payload?.paths) ? request.payload.paths.length : undefined,
      payloadModelType: request.payload?.model?.type,
      payloadModelFormat: request.payload?.model?.format,
      payloadTrack: request.payload?.track,
      payloadOpen: request.payload?.open,
    };
  }

  private log(message: string, details?: any): void {
    if (details === undefined) {
      console.info('[AnalySim Angular JupyterLite Bridge]', message);
      return;
    }

    console.info('[AnalySim Angular JupyterLite Bridge]', message, details);
  }
}
