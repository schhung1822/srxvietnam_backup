import fs from 'node:fs';
import path from 'node:path';

let hasLoadedServerEnv = false;

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const envText = fs.readFileSync(filePath, 'utf8');

  envText.split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();

    if (!key || process.env[key]) {
      return;
    }

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  });
}

export function ensureServerEnvLoaded() {
  if (hasLoadedServerEnv) {
    return;
  }

  hasLoadedServerEnv = true;

  const candidateDirectories = [];
  let currentDirectory = process.cwd();

  for (let depth = 0; depth < 4; depth += 1) {
    candidateDirectories.push(currentDirectory);

    const parentDirectory = path.dirname(currentDirectory);

    if (parentDirectory === currentDirectory) {
      break;
    }

    currentDirectory = parentDirectory;
  }

  candidateDirectories.forEach((directoryPath) => {
    loadEnvFile(path.join(directoryPath, '.env.local'));
    loadEnvFile(path.join(directoryPath, '.env'));
  });
}
