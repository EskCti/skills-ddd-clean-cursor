import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

function ensureTrailingLineBreak(text) {
  return text.endsWith('\n') ? text : `${text}\n`;
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function toLogPath(rootDir, targetPath) {
  if (typeof targetPath !== 'string' || targetPath.trim() === '') return '';
  const absolute = path.isAbsolute(targetPath) ? targetPath : path.resolve(rootDir, targetPath);
  return path.relative(rootDir, absolute).replace(/\\/g, '/');
}

export function createSkillRunOps({ rootDir, logger, dryRun = false }) {
  async function ensureDir(dirPath, options = {}) {
    const exists = await pathExists(dirPath);
    if (exists) return false;

    logger?.file?.('mkdir', dirPath, {
      dryRun,
      note: options.note,
    });

    if (!dryRun) {
      await fs.mkdir(dirPath, { recursive: true });
    }

    return true;
  }

  async function writeTextFile(filePath, content, options = {}) {
    const {
      ensureNewline = true,
      note = '',
      markRiskOnOverwrite = true,
    } = options;

    const normalized = ensureNewline ? ensureTrailingLineBreak(content) : content;
    let previous = null;

    try {
      previous = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      if (!error || error.code !== 'ENOENT') {
        throw error;
      }
    }

    if (previous === normalized) {
      logger?.file?.('skip', filePath, {
        dryRun,
        note: note || 'inalterado',
      });
      return {
        changed: false,
        created: false,
        updated: false,
      };
    }

    const created = previous === null;
    logger?.file?.(created ? 'create' : 'update', filePath, {
      dryRun,
      note,
      riskOnOverwrite: !created && markRiskOnOverwrite,
    });

    if (!dryRun) {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, normalized, 'utf8');
    }

    return {
      changed: true,
      created,
      updated: !created,
    };
  }

  async function writeJsonFile(filePath, data, options = {}) {
    return writeTextFile(filePath, `${JSON.stringify(data, null, 2)}\n`, {
      ensureNewline: false,
      ...options,
    });
  }

  async function removePath(targetPath, options = {}) {
    const {
      recursive = false,
      force = true,
      note = '',
      markRisk = true,
    } = options;

    if (!(await pathExists(targetPath))) {
      return false;
    }

    logger?.file?.('delete', targetPath, {
      dryRun,
      note,
      riskOnDelete: markRisk,
    });

    if (!dryRun) {
      await fs.rm(targetPath, { recursive, force });
    }

    return true;
  }

  async function renamePath(fromPath, toPath, options = {}) {
    const {
      note = '',
      markRisk = true,
    } = options;

    if (!(await pathExists(fromPath))) {
      return false;
    }

    if (await pathExists(toPath)) {
      logger?.risk?.(`destino existente impede rename: ${toLogPath(rootDir, toPath)}`);
      return false;
    }

    const fromRel = toLogPath(rootDir, fromPath);
    const toRel = toLogPath(rootDir, toPath);
    logger?.file?.('rename', `${fromRel} -> ${toRel}`, {
      dryRun,
      note,
      riskOnRename: markRisk,
    });

    if (!dryRun) {
      await fs.mkdir(path.dirname(toPath), { recursive: true });
      await fs.rename(fromPath, toPath);
    }

    return true;
  }

  function runCommand(cmd, args = [], cwd = rootDir) {
    logger?.command?.(cmd, args);

    return new Promise((resolve, reject) => {
      const child = spawn(cmd, args, { cwd, stdio: 'inherit' });
      child.on('error', reject);
      child.on('exit', (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        reject(new Error(`Command failed: ${cmd} ${args.join(' ')} (exit ${code})`));
      });
    });
  }

  return {
    dryRun,
    runCommand,
    ensureDir,
    writeTextFile,
    writeJsonFile,
    removePath,
    renamePath,
    pathExists,
  };
}
