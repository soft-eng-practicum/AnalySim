const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const clientRoot = path.resolve(__dirname, '..');
const extensionRoot = path.join(clientRoot, 'src', 'assets', 'jupyter', 'analysim-jupyterlite-bridge');
const venvPath = path.join(clientRoot, 'src', 'assets', 'jupyter', 'venv');

const tscCommand = process.platform === 'win32'
  ? path.join(extensionRoot, 'node_modules', '.bin', 'tsc.cmd')
  : path.join(extensionRoot, 'node_modules', '.bin', 'tsc');

const jupyterCommand = process.platform === 'win32'
  ? path.join(venvPath, 'Scripts', 'jupyter.exe')
  : path.join(venvPath, 'bin', 'jupyter');

function run(command, args, cwd) {
  console.log(`> ${command} ${args.join(' ')}`);
  execFileSync(command, args, {
    cwd,
    stdio: 'inherit',
  });
}

if (!fs.existsSync(tscCommand)) {
  throw new Error(`Extension TypeScript compiler was not found: ${tscCommand}. Run npm run setup:jupyterlite-extension first.`);
}

if (!fs.existsSync(jupyterCommand)) {
  throw new Error(`Jupyter executable was not found in the venv: ${jupyterCommand}. Run npm run setup:jupyterlite-venv first.`);
}

run(tscCommand, [], extensionRoot);
run(jupyterCommand, ['labextension', 'build', '.'], extensionRoot);
