# AnalySim JupyterLite Bridge

This JupyterLab frontend extension is the only supported integration point between Angular and embedded JupyterLite contents.

Angular must not read or write JupyterLite IndexedDB/localForage stores directly. Those database names and store names are JupyterLite implementation details and can change between JupyterLite versions or storage configurations. The extension waits for `app.restored`, then exposes a structured `postMessage` protocol backed by `app.serviceManager.contents`.

The current deployment uses project-root scoping under `analysim-projects/{projectName}/` to prevent one project from saving another project's files to the backend. JupyterLite's underlying browser storage can still be shared on the same origin unless the Lite site is built with project-specific storage configuration or served from project-specific base URLs.
