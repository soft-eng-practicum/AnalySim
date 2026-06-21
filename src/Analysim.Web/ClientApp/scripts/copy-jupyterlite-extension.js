const fs = require('fs');
const path = require('path');

const clientRoot = path.resolve(__dirname, '..');
const liteRoot = path.join(clientRoot, 'src', 'assets', 'jupyter');
const packageName = '@analysim/jupyterlite-bridge';
const source = path.join(liteRoot, 'analysim-jupyterlite-bridge', 'labextension');
const destination = path.join(liteRoot, 'dist', 'extensions', '@analysim', 'jupyterlite-bridge');
const configPath = path.join(liteRoot, 'dist', 'jupyter-lite.json');

if (!fs.existsSync(source)) {
  throw new Error(`Bridge labextension output was not found: ${source}`);
}

if (!fs.existsSync(path.dirname(destination))) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
}

fs.rmSync(destination, { recursive: true, force: true });
fs.cpSync(source, destination, { recursive: true });

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const jupyterConfigData = config['jupyter-config-data'] || {};
const extensions = jupyterConfigData.federated_extensions || [];
const bridgeEntry = {
  extension: './extension',
  load: 'static/remoteEntry.js',
  name: packageName,
};

jupyterConfigData.federated_extensions = [
  bridgeEntry,
  ...extensions.filter(extension => extension.name !== packageName),
];
config['jupyter-config-data'] = jupyterConfigData;
fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

console.log(`Installed ${packageName} into ${destination}`);
