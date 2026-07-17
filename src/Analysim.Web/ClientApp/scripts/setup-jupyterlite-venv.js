const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const clientRoot = path.resolve(__dirname, '..');
const jupyterRoot = path.join(clientRoot, 'src', 'assets', 'jupyter');
const venvPath = path.join(jupyterRoot, 'venv');
const requirementsPath = path.join(jupyterRoot, 'requirements.txt');

function run(command, args, options = {}) {
  console.log(`> ${command} ${args.join(' ')}`);
  execFileSync(command, args, {
    cwd: options.cwd || clientRoot,
    stdio: 'inherit',
  });
}

function findPython() {
  for (const command of ['python3', 'python']) {
    try {
      execFileSync(command, ['--version'], { stdio: 'ignore' });
      return command;
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error('Could not find python3 or python on PATH.');
}

function getVenvPython() {
  return process.platform === 'win32'
    ? path.join(venvPath, 'Scripts', 'python.exe')
    : path.join(venvPath, 'bin', 'python');
}

if (!fs.existsSync(requirementsPath)) {
  throw new Error(`JupyterLite requirements file was not found: ${requirementsPath}`);
}

run(findPython(), ['-m', 'venv', venvPath]);

const venvPython = getVenvPython();
run(venvPython, ['-m', 'pip', 'install', '--upgrade', 'pip']);
run(venvPython, ['-m', 'pip', 'install', '-r', requirementsPath]);
