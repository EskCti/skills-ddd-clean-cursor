import { promises as fs } from 'node:fs';
import path from 'node:path';

const LOG_DIR = '.log';
const LOG_FILE = 'skills.log';
const GITIGNORE_ENTRY = '.log/';
const ACTION_TAGS = {
  create: 'FILE_CREATE',
  update: 'FILE_UPDATE',
  delete: 'FILE_DELETE',
  mkdir: 'DIR_CREATE',
  rename: 'FILE_RENAME',
  preserve: 'FILE_PRESERVE',
  skip: 'FILE_SKIP',
  unknown: 'FILE',
};

function normalizeMessage(message) {
  return String(message ?? '')
    .replace(/\r?\n+/g, ' ')
    .trim();
}

function normalizePathForLog(filePath) {
  return filePath.replace(/\\/g, '/');
}

function buildCommandText(rootDir, commandArgs) {
  const scriptArg = process.argv[1] ? path.resolve(process.argv[1]) : '';
  const scriptPath = scriptArg ? normalizePathForLog(path.relative(rootDir, scriptArg)) : '';

  const parts = ['node'];
  if (scriptPath && scriptPath !== '') {
    parts.push(scriptPath);
  }
  if (Array.isArray(commandArgs) && commandArgs.length > 0) {
    parts.push(...commandArgs);
  }
  return parts.join(' ');
}

function formatCommand(cmd, args = []) {
  const parts = [cmd, ...(Array.isArray(args) ? args : [])]
    .filter((part) => typeof part === 'string' && part.trim() !== '')
    .map((part) => part.trim());
  return parts.join(' ');
}

function normalizeTag(tag) {
  const normalized = String(tag ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized || 'INFO';
}

function toRelativeLogPath(rootDir, targetPath) {
  if (typeof targetPath !== 'string' || targetPath.trim() === '') return '';
  const trimmed = targetPath.trim();
  const absolute = path.isAbsolute(trimmed) ? trimmed : path.resolve(rootDir, trimmed);
  const relative = path.relative(rootDir, absolute);

  if (!relative || relative.startsWith('..')) {
    return normalizePathForLog(trimmed);
  }

  return normalizePathForLog(relative);
}

async function ensureGitIgnoreEntry(rootDir, entry, options = {}) {
  const { createIfMissing = true } = options;
  const gitignorePath = path.join(rootDir, '.gitignore');
  let content = '';

  try {
    content = await fs.readFile(gitignorePath, 'utf8');
  } catch (error) {
    if (!error || error.code !== 'ENOENT') throw error;
    if (!createIfMissing) {
      return false;
    }
  }

  const hasEntry = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .includes(entry);

  if (hasEntry) return;

  const base = content.replace(/\s*$/g, '');
  const next = base ? `${base}\n\n${entry}\n` : `${entry}\n`;
  await fs.writeFile(gitignorePath, next, 'utf8');
  return true;
}

async function appendLogBlock(logFilePath, blockLines) {
  const payload = `${blockLines.join('\n')}\n\n`;
  await fs.appendFile(logFilePath, payload, 'utf8');
}

export async function createSkillRunLogger({
  rootDir,
  skillName,
  commandArgs = process.argv.slice(2),
  deferGitignoreEnsure = false,
  gitignoreCreateIfMissing = true,
}) {
  const safeSkillName = normalizeMessage(skillName) || 'skill';
  const logDirPath = path.join(rootDir, LOG_DIR);
  const logFilePath = path.join(logDirPath, LOG_FILE);
  const lines = [];
  let finalized = false;

  await fs.mkdir(logDirPath, { recursive: true });
  if (!deferGitignoreEnsure) {
    await ensureGitIgnoreEntry(rootDir, GITIGNORE_ENTRY, {
      createIfMissing: gitignoreCreateIfMissing,
    });
  }

  const commandText = buildCommandText(rootDir, commandArgs);
  function push(tag, message) {
    const text = normalizeMessage(message);
    if (!text) return;
    lines.push(`- [${normalizeTag(tag)}] ${text}`);
  }

  if (commandText) {
    push('CMD', `\`${commandText}\``);
  }

  function step(message, tag = 'STEP') {
    push(tag, message);
  }

  function info(message) {
    push('INFO', message);
  }

  function warn(message) {
    push('WARN', message);
  }

  function risk(message) {
    push('RISK', message);
  }

  function ai(message) {
    push('AI', message);
  }

  function command(cmd, args = []) {
    const text = formatCommand(cmd, args);
    if (!text) return;
    push('CMD', `\`${text}\``);
  }

  function file(action, targetPath, options = {}) {
    const {
      note = '',
      dryRun = false,
      riskOnOverwrite = false,
      riskOnDelete = false,
      riskOnRename = false,
    } = options;
    const normalizedAction = typeof action === 'string' ? action.trim().toLowerCase() : '';
    const tag = ACTION_TAGS[normalizedAction] || ACTION_TAGS.unknown;
    const relativePath = toRelativeLogPath(rootDir, targetPath);
    const parts = [relativePath || normalizeMessage(targetPath), normalizeMessage(note), dryRun ? '(dry-run)' : '']
      .filter(Boolean)
      .join(' ');

    push(tag, parts);

    if (normalizedAction === 'update' && riskOnOverwrite) {
      push('RISK', `sobrescrita detectada: ${relativePath || normalizeMessage(targetPath)}`);
    }

    if (normalizedAction === 'delete' && riskOnDelete) {
      push('RISK', `remocao detectada: ${relativePath || normalizeMessage(targetPath)}`);
    }

    if (normalizedAction === 'rename' && riskOnRename) {
      push('RISK', `movimentacao detectada: ${relativePath || normalizeMessage(targetPath)}`);
    }
  }

  async function finalize({ error }) {
    if (finalized) return;
    finalized = true;

    if (deferGitignoreEnsure) {
      await ensureGitIgnoreEntry(rootDir, GITIGNORE_ENTRY, {
        createIfMissing: gitignoreCreateIfMissing,
      });
    }

    if (error) {
      push('FAIL', normalizeMessage(error.message || error));
    }

    const blockLines = [`# ${safeSkillName}`, ...lines];
    await appendLogBlock(logFilePath, blockLines);
  }

  return {
    logFilePath,
    step,
    info,
    warn,
    risk,
    ai,
    command,
    file,
    success: () => finalize({}),
    failure: (error) => finalize({ error }),
  };
}
