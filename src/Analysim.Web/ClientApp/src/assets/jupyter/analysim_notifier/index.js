/**
 * analysim_notifier/index.js
 *
 * Notifies the parent AnalySim window when JupyterLite is fully ready.
 * Uses app.restored which waits for the complete UI restore, making it
 * more reliable than app.started for detecting notebook readiness.
 */

const plugin = {
  id: 'analysim-notifier:plugin',
  autoStart: true,
  requires: [],
  activate: (app) => {
    app.restored.then(() => {
      console.log('AnalySim: notebook environment ready, notifying parent window');
      window.parent.postMessage('jupyterlite-load', '*');
    });
  }
};

export default plugin;
