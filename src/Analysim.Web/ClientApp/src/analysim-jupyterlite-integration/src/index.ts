import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';

const LOG_PREFIX = '[analysim-jupyterlite-integration]';
const READY_MESSAGE = 'jupyterlite-load';

/**
 * Initialization data for the analysim-jupyterlite-integration extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'analysim-jupyterlite-integration:plugin',
  description:
    'A JupyterLite frontend extension that enables seamless integration between JupyterLite and Analysim.',
  autoStart: true,

  activate: (app: JupyterFrontEnd) => {
    console.debug(`${LOG_PREFIX} Plugin activated`);

    // Non-blocking: avoid deadlocks with app.restored.
    void app.restored
      .then(() => {
        window.parent.postMessage(READY_MESSAGE, '*');
        console.debug(`${LOG_PREFIX} Ready signal sent (${READY_MESSAGE})`);
      })
      .catch((err) => {
        console.error(`${LOG_PREFIX} app.restored rejected`, err);
      });
  }
};

export default plugin;

