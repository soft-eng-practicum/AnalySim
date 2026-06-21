const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const clientRoot = path.resolve(__dirname, '..');
const jupyterRoot = path.join(clientRoot, 'src', 'assets', 'jupyter');
const distPath = path.join(jupyterRoot, 'dist');
const venvPath = path.join(jupyterRoot, 'venv');

const jupyterCommand = process.platform === 'win32'
  ? path.join(venvPath, 'Scripts', 'jupyter.exe')
  : path.join(venvPath, 'bin', 'jupyter');

if (!fs.existsSync(jupyterCommand)) {
  throw new Error(`Jupyter executable was not found in the venv: ${jupyterCommand}. Run npm run setup:jupyterlite-venv first.`);
}

console.log(`> ${jupyterCommand} lite build --output-dir ${distPath}`);
execFileSync(jupyterCommand, ['lite', 'build', '--output-dir', distPath], {
  cwd: clientRoot,
  stdio: 'inherit',
});
