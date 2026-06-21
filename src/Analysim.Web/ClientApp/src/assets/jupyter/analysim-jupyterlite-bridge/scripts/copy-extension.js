const fs = require('fs');
const path = require('path');

const packageRoot = path.resolve(__dirname, '..');
const outputDir = path.join(packageRoot, 'labextension');
const liteExtensionDir = path.resolve(packageRoot, '..', 'dist', 'extensions', '@analysim', 'jupyterlite-bridge');

fs.rmSync(liteExtensionDir, { recursive: true, force: true });
fs.mkdirSync(path.dirname(liteExtensionDir), { recursive: true });
fs.cpSync(outputDir, liteExtensionDir, { recursive: true });

console.log(`Copied ${outputDir} to ${liteExtensionDir}`);
