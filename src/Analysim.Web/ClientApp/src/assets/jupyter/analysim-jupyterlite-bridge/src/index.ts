import type { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';

type ProjectId = string | number;
type ProjectScope = string | number;

type ContentsModel = {
  path: string;
  name?: string;
  type?: string;
  content?: any;
  [key: string]: any;
};

type AnalysimJupyterRequest = {
  source: 'analysim-angular';
  type:
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
  requestId: string;
  projectId?: ProjectId;
  payload?: any;
};

const plugin: JupyterFrontEndPlugin<void> = {
  id: '@analysim/jupyterlite-bridge:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    log('plugin activated; scheduling bridge creation after app.restored');
    void app.restored
      .then(() => {
        log('app.restored resolved; creating bridge');
        void createBridge(app);
      })
      .catch((error: unknown) => {
        log('app.restored rejected; bridge cannot start', {
          error: error instanceof Error ? error.message : String(error),
        });
      });
  },
};

async function createBridge(app: JupyterFrontEnd): Promise<void> {
  let projectId: ProjectId = 'default';
  let projectName: ProjectScope = 'default';
  let projectRoot = getProjectRoot(projectName);
  let allowedOrigin = getParentOrigin();
  let trackedFiles = loadTrackedFiles(projectId);
  let panel: HTMLDivElement | undefined;

  const postEvent = (type: string, data?: any): void => {
    log('posting event to Angular parent', { type, projectId, projectName, allowedOrigin: allowedOrigin || '*' });
    window.parent.postMessage(
      { source: 'analysim-jupyterlite', type, projectId, projectName, data },
      allowedOrigin || '*'
    );
  };

  const sendResponse = (requestId: string, ok: boolean, data?: any, error?: any): void => {
    log(ok ? 'sending success response' : 'sending error response', {
      requestId,
      ok,
      error: error ? error.message || String(error) : undefined,
    });
    window.parent.postMessage(
      {
        source: 'analysim-jupyterlite',
        type: 'analysim:response',
        requestId,
        ok,
        data,
        error: error ? { message: error.message || String(error), stack: error.stack } : undefined,
      },
      allowedOrigin || '*'
    );
  };

  const saveTrackedFiles = (): void => {
    log('saving tracked files', { projectId, paths: [...trackedFiles].sort() });
    localStorage.setItem(getTrackedFilesKey(projectId), JSON.stringify([...trackedFiles].sort()));
    postEvent('analysim:tracked-files-changed', { paths: [...trackedFiles].sort() });
    void renderPanel();
  };

  const renderPanel = async (): Promise<void> => {
    if (!panel) {
      log('creating tracked-files panel');
      panel = document.createElement('div');
      panel.className = 'analysim-bridge-panel';
      panel.innerHTML = '<button type="button" class="analysim-bridge-toggle">AnalySim</button><div class="analysim-bridge-body"></div>';
      document.body.appendChild(panel);
      injectStyles();
      panel.querySelector('.analysim-bridge-toggle')?.addEventListener('click', () => {
        panel?.classList.toggle('analysim-bridge-panel-open');
      });
    }

    const body = panel.querySelector('.analysim-bridge-body');
    if (!body) {
      return;
    }

    const names = await listFileNames(projectRoot);
    log('rendering tracked-files panel', { projectRoot, fileCount: names.length, trackedCount: trackedFiles.size });
    body.innerHTML = '<h2>Tracked files</h2>';

    if (names.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'No project files yet.';
      body.appendChild(empty);
      return;
    }

    names.forEach(path => {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = trackedFiles.has(path);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          trackedFiles.add(path);
        } else {
          trackedFiles.delete(path);
        }
        saveTrackedFiles();
      });
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(path));
      body.appendChild(label);
    });
  };

  window.addEventListener('message', event => {
    void (async () => {
      const request = event.data as AnalysimJupyterRequest;
      if (!isValidRequest(request) || event.source !== window.parent) {
        if (request?.source === 'analysim-angular') {
          log('ignored Angular-looking message with invalid shape or source', {
            type: request?.type,
            origin: event.origin,
            sourceMatchesParent: event.source === window.parent,
          });
        }
        return;
      }

      if (allowedOrigin && event.origin !== allowedOrigin) {
        log('ignored message from unexpected origin', { type: request.type, origin: event.origin, allowedOrigin });
        return;
      }

      try {
        log('received request', sanitizeRequestForLog(request));
        const data = await handleRequest(request);
        sendResponse(request.requestId, true, data);
      } catch (error) {
        log('request failed', {
          requestId: request.requestId,
          type: request.type,
          error: error instanceof Error ? error.message : String(error),
        });
        sendResponse(request.requestId, false, undefined, error);
      }
    })();
  });

  const contents = app.serviceManager.contents as any;
  log('bridge initialized', {
    initialProjectId: projectId,
    initialProjectRoot: projectRoot,
    allowedOrigin: allowedOrigin || '*',
    hasContentsManager: Boolean(contents),
    hasCheckpointApi: typeof contents?.listCheckpoints === 'function',
  });

  await waitForContentsReady();

  contents.fileChanged?.connect?.((_sender: any, change: any) => {
    const path = change?.newValue?.path || change?.oldValue?.path;
    const relativePath = toRelativeProjectPath(path, projectRoot);
    if (!relativePath) {
      return;
    }
    log('contents fileChanged signal', { path, relativePath, type: change?.type });
    postEvent('analysim:file-changed', { path: relativePath, change });
    void renderPanel();
  });

  postEvent('analysim:jupyterlite-ready');

  async function handleRequest(request: AnalysimJupyterRequest): Promise<any> {
    switch (request.type) {
      case 'analysim:init':
        projectId = request.payload?.projectId ?? request.projectId ?? 'default';
        projectName = request.payload?.projectName ?? projectId ?? 'default';
        projectRoot = getProjectRoot(projectName);
        allowedOrigin = request.payload?.allowedOrigin || eventOriginFallback(allowedOrigin);
        trackedFiles = new Set((request.payload?.trackedFilePaths || [...loadTrackedFiles(projectId ?? projectName)]).map((path: string) => normalizeRelativePath(path)));
        log('initializing project scope', {
          projectId,
          projectName,
          projectRoot,
          allowedOrigin,
          initialFileCount: Array.isArray(request.payload?.initialFiles) ? request.payload.initialFiles.length : 0,
          trackedCount: trackedFiles.size,
        });
        await ensureDirectory(projectRoot);
        await saveInitialFiles(request.payload?.initialFiles || []);
        saveTrackedFiles();
        await renderPanel();
        return { projectId, projectName, projectRoot };
      case 'analysim:add-file': {
        const absolutePath = resolveProjectPath(request.payload?.path, request.payload?.absolute);
        log('saving file through contents manager', {
          requestPath: request.payload?.path,
          absolutePath,
          track: Boolean(request.payload?.track),
          open: Boolean(request.payload?.open),
          modelType: request.payload?.model?.type,
          modelFormat: request.payload?.model?.format,
        });
        await ensureDirectory(parentPath(absolutePath));
        const model = prepareModelForSave(request.payload?.model, absolutePath);
        const saved = await withContentsRetry<ContentsModel>(`save ${absolutePath}`, () => contents.save(absolutePath, model) as Promise<ContentsModel>);
        if (request.payload?.track) {
          trackedFiles.add(toRelativeProjectPath(absolutePath, projectRoot) || request.payload?.path);
          saveTrackedFiles();
        } else {
          await renderPanel();
        }
        if (request.payload?.open) {
          await app.commands.execute('docmanager:open', { path: absolutePath });
        }
        return toAngularModel(saved);
      }
      case 'analysim:get-file': {
        log('getting file through contents manager', {
          requestPath: request.payload?.path,
          absolutePath: resolveProjectPath(request.payload?.path, request.payload?.absolute),
        });
        const model = await withContentsRetry<ContentsModel>(
          `get ${resolveProjectPath(request.payload?.path, request.payload?.absolute)}`,
          () => contents.get(resolveProjectPath(request.payload?.path, request.payload?.absolute), { content: true }) as Promise<ContentsModel>
        );
        return toAngularModel(model);
      }
      case 'analysim:get-all-files':
        log('listing all files', { projectRoot });
        return listFiles(projectRoot);
      case 'analysim:get-file-names':
        log('listing file names', { projectRoot });
        return listFileNames(projectRoot);
      case 'analysim:get-checkpoints':
        log('listing checkpoints', {
          requestPath: request.payload?.path,
          absolutePath: resolveProjectPath(request.payload?.path, request.payload?.absolute),
        });
        return withContentsRetry(
          `list checkpoints ${resolveProjectPath(request.payload?.path, request.payload?.absolute)}`,
          () => contents.listCheckpoints(resolveProjectPath(request.payload?.path, request.payload?.absolute))
        );
      case 'analysim:get-tracked-file-names':
        log('returning tracked file names', { trackedCount: trackedFiles.size });
        return [...trackedFiles].sort();
      case 'analysim:get-unsaved-file-names':
        return getUnsavedFileNames();
      case 'analysim:save-tracked-files':
        return saveUnsavedTrackedFiles();
      case 'analysim:track-file':
        log('tracking file', { path: request.payload?.path });
        trackedFiles.add(normalizeRelativePath(request.payload?.path));
        saveTrackedFiles();
        return [...trackedFiles].sort();
      case 'analysim:untrack-file':
        log('untracking file', { path: request.payload?.path });
        trackedFiles.delete(normalizeRelativePath(request.payload?.path));
        saveTrackedFiles();
        return [...trackedFiles].sort();
      case 'analysim:set-tracked-files':
        log('replacing tracked files', { count: Array.isArray(request.payload?.paths) ? request.payload.paths.length : 0 });
        trackedFiles = new Set((request.payload?.paths || []).map(normalizeRelativePath));
        saveTrackedFiles();
        return [...trackedFiles].sort();
      default:
        throw new Error(`Unsupported request type: ${request.type}`);
    }
  }

  async function saveInitialFiles(files: any[]): Promise<void> {
    for (const file of files) {
      const absolutePath = resolveProjectPath(file.path, file.absolute);
      log('saving initial file', { requestPath: file.path, absolutePath, track: Boolean(file.track), open: Boolean(file.open) });
      await ensureDirectory(parentPath(absolutePath));
      await withContentsRetry(
        `save initial file ${absolutePath}`,
        () => contents.save(absolutePath, prepareModelForSave(file.model, absolutePath))
      );
      if (file.track) {
        trackedFiles.add(toRelativeProjectPath(absolutePath, projectRoot) || normalizeRelativePath(file.path));
      }
      if (file.open) {
        await app.commands.execute('docmanager:open', { path: absolutePath });
      }
    }
  }

  function resolveProjectPath(path: string, absolute = false): string {
    const normalized = normalizeRelativePath(path);
    return absolute ? normalized : `${projectRoot}/${normalized}`;
  }

  async function listFiles(path: string): Promise<any[]> {
    const model = await withContentsRetry<ContentsModel>(`list ${path}`, () => contents.get(path, { content: true }) as Promise<ContentsModel>);
    const children = Array.isArray(model.content) ? model.content : [];
    const files: any[] = [];

    for (const child of children) {
      if (child.type === 'directory') {
        files.push(...await listFiles(child.path));
      } else {
        const fileModel = await withContentsRetry<ContentsModel>(`get listed file ${child.path}`, () => contents.get(child.path, { content: true }) as Promise<ContentsModel>);
        files.push({ path: toRelativeProjectPath(child.path, projectRoot), model: toAngularModel(fileModel) });
      }
    }

    return files;
  }

  async function listFileNames(path: string): Promise<string[]> {
    const files = await listFiles(path);
    return files.map(file => file.path).filter(Boolean).sort();
  }

  function getUnsavedFileNames(): string[] {
    const dirtyTrackedContexts = getDirtyTrackedContexts();
    const paths = dirtyTrackedContexts.map(item => item.path).sort();
    log('returning unsaved tracked file names', { count: paths.length, paths });
    return paths;
  }

  async function saveUnsavedTrackedFiles(): Promise<{ saved: string[]; failed: { path: string; message: string }[] }> {
    const dirtyTrackedContexts = getDirtyTrackedContexts();
    const saved: string[] = [];
    const failed: { path: string; message: string }[] = [];

    log('saving unsaved tracked files', { count: dirtyTrackedContexts.length });

    for (const item of dirtyTrackedContexts) {
      try {
        if (typeof item.context?.save !== 'function') {
          throw new Error('JupyterLite document context does not expose a save method.');
        }

        await item.context.save();
        saved.push(item.path);
        log('saved tracked dirty file through document context', { path: item.path });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failed.push({ path: item.path, message });
        log('failed to save tracked dirty file through document context', { path: item.path, error: message });
      }
    }

    return { saved: saved.sort(), failed };
  }

  function getDirtyTrackedContexts(): { path: string; context: any }[] {
    const dirtyTrackedContexts = new Map<string, any>();
    const mainWidgets = getMainAreaWidgets();

    log('checking unsaved tracked file names', { widgetCount: mainWidgets.length, trackedCount: trackedFiles.size });

    for (const widget of mainWidgets) {
      const context = getWidgetContext(widget);
      const absolutePath = context?.path || context?.model?.path || widget?.context?.path;
      const relativePath = toRelativeProjectPath(absolutePath, projectRoot);

      if (!relativePath || !trackedFiles.has(relativePath) || !isContextDirty(context)) {
        continue;
      }

      dirtyTrackedContexts.set(relativePath, context);
    }

    return [...dirtyTrackedContexts.entries()].map(([path, context]) => ({ path, context }));
  }

  function getMainAreaWidgets(): any[] {
    const shell = app.shell as any;
    if (typeof shell.widgets !== 'function') {
      return [];
    }

    const widgets = shell.widgets('main');
    if (!widgets) {
      return [];
    }

    if (typeof widgets[Symbol.iterator] === 'function') {
      return Array.from(widgets as Iterable<any>);
    }

    if (typeof widgets.next === 'function') {
      const collected: any[] = [];
      let widget = widgets.next();
      while (widget) {
        collected.push(widget);
        widget = widgets.next();
      }
      return collected;
    }

    return [];
  }

  function getWidgetContext(widget: any): any {
    return widget?.context || widget?.content?.context || widget?.content?.widget?.context;
  }

  function isContextDirty(context: any): boolean {
    return Boolean(
      context?.model?.dirty ||
      context?.model?.isDirty ||
      context?.model?.sharedModel?.isDirty ||
      context?.isDirty
    );
  }

  async function ensureDirectory(path: string): Promise<void> {
    const normalized = normalizeRelativePath(path);
    if (!normalized) {
      return;
    }

    const parts = normalized.split('/');
    let current = '';

    for (const part of parts) {
      const next = current ? `${current}/${part}` : part;
      try {
        await withContentsRetry(`probe directory ${next}`, () => contents.get(next, { content: false }));
        log('directory exists', { path: next });
      } catch {
        log('creating directory', { path: next, parent: current });
        const created = await withContentsRetry<ContentsModel>(
          `create directory ${next}`,
          () => contents.newUntitled({ path: current, type: 'directory' }) as Promise<ContentsModel>
        );
        if (created.path !== next) {
          log('renaming created directory', { from: created.path, to: next });
          await withContentsRetry(`rename directory ${created.path} to ${next}`, () => contents.rename(created.path, next));
        }
      }
      current = next;
    }
  }

  function prepareModelForSave(model: any, path: string): any {
    return {
      ...model,
      name: basename(path),
      path,
    };
  }

  function toAngularModel(model: any): any {
    const relativePath = toRelativeProjectPath(model.path, projectRoot);
    return relativePath ? { ...model, path: relativePath, name: basename(relativePath) } : model;
  }

  async function waitForContentsReady(): Promise<void> {
    log('waiting for JupyterLite contents manager readiness');
    await withContentsRetry('contents root readiness probe', () => contents.get('', { content: false }), 30, 100);
    log('JupyterLite contents manager is ready');
  }

  async function withContentsRetry<T>(
    label: string,
    operation: () => Promise<T>,
    maxAttempts = 8,
    delayMs = 150
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (!isTransientContentsError(error) || attempt === maxAttempts) {
          throw error;
        }

        log('contents manager not ready yet; retrying operation', {
          label,
          attempt,
          maxAttempts,
          error: error instanceof Error ? error.message : String(error),
        });
        await sleep(delayMs * attempt);
      }
    }

    throw lastError;
  }
}

function isValidRequest(value: any): value is AnalysimJupyterRequest {
  return value?.source === 'analysim-angular' && typeof value.requestId === 'string' && typeof value.type === 'string';
}

function getParentOrigin(): string {
  try {
    return document.referrer ? new URL(document.referrer).origin : '';
  } catch {
    return '';
  }
}

function eventOriginFallback(origin: string): string {
  return origin || window.location.origin;
}

function getProjectRoot(projectScope: ProjectScope): string {
  return `analysim-projects/${encodeURIComponent(String(projectScope || 'default'))}`;
}

function getTrackedFilesKey(projectId: ProjectId): string {
  return `analysim:tracked-files:${projectId || 'default'}`;
}

function loadTrackedFiles(projectId: ProjectId): Set<string> {
  try {
    const raw = localStorage.getItem(getTrackedFilesKey(projectId));
    return new Set(raw ? JSON.parse(raw).map((path: string) => normalizeRelativePath(path)) : []);
  } catch {
    return new Set();
  }
}

function normalizeRelativePath(path: any): string {
  const normalized = String(path || '').replace(/\\/g, '/').replace(/^\/+/, '');
  const parts = normalized.split('/').filter(part => part && part !== '.');
  if (parts.some(part => part === '..')) {
    throw new Error(`Unsafe JupyterLite path: ${path}`);
  }
  return parts.join('/');
}

function toRelativeProjectPath(path: string, projectRoot: string): string {
  const normalized = normalizeRelativePath(path);
  return normalized === projectRoot
    ? ''
    : normalized.startsWith(`${projectRoot}/`)
      ? normalized.slice(projectRoot.length + 1)
      : '';
}

function parentPath(path: string): string {
  const parts = normalizeRelativePath(path).split('/');
  parts.pop();
  return parts.join('/');
}

function basename(path: string): string {
  return normalizeRelativePath(path).split('/').pop() || path;
}

function isTransientContentsError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('_dbInfo is null') || message.includes('property "db"');
}

function sleep(delayMs: number): Promise<void> {
  return new Promise(resolve => window.setTimeout(resolve, delayMs));
}

function sanitizeRequestForLog(request: AnalysimJupyterRequest): Record<string, any> {
  return {
    type: request.type,
    requestId: request.requestId,
    projectId: request.projectId,
    payloadPath: request.payload?.path,
    payloadPathsCount: Array.isArray(request.payload?.paths) ? request.payload.paths.length : undefined,
    payloadInitialFilesCount: Array.isArray(request.payload?.initialFiles) ? request.payload.initialFiles.length : undefined,
    payloadModelType: request.payload?.model?.type,
    payloadModelFormat: request.payload?.model?.format,
    payloadTrack: request.payload?.track,
    payloadOpen: request.payload?.open,
  };
}

function log(message: string, details?: any): void {
  if (details === undefined) {
    console.info('[AnalySim JupyterLite Bridge]', message);
    return;
  }

  console.info('[AnalySim JupyterLite Bridge]', message, details);
}

function injectStyles(): void {
  if (document.getElementById('analysim-bridge-style')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'analysim-bridge-style';
  style.textContent = `
    .analysim-bridge-panel {
      bottom: 18px;
      color: #1f2937;
      font: 13px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      position: fixed;
      right: 18px;
      z-index: 10000;
    }
    .analysim-bridge-toggle {
      background: #ffdc00;
      border: 1px solid #d1b600;
      border-radius: 4px;
      color: #111827;
      cursor: pointer;
      font-weight: 600;
      padding: 6px 10px;
    }
    .analysim-bridge-body {
      background: #fff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18);
      display: none;
      margin-top: 8px;
      max-height: 320px;
      overflow: auto;
      padding: 10px;
      width: 280px;
    }
    .analysim-bridge-panel-open .analysim-bridge-body {
      display: block;
    }
    .analysim-bridge-body h2 {
      font-size: 14px;
      margin: 0 0 8px;
    }
    .analysim-bridge-body label {
      align-items: center;
      display: flex;
      gap: 8px;
      margin: 6px 0;
      overflow-wrap: anywhere;
    }
  `;
  document.head.appendChild(style);
}

export default plugin;
