import { promises as fs } from 'node:fs';
import path from 'node:path';

const LOG_DIR = '.log';
const LOG_FILE = 'skills.log';
const GITIGNORE_ENTRY = '.log/';

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
  if (commandText) {
    lines.push(`- comando: \`${commandText}\``);
  }

  function step(message) {
    const text = normalizeMessage(message);
    if (!text) return;
    lines.push(`- ${text}`);
  }

  function command(cmd, args = []) {
    const text = formatCommand(cmd, args);
    if (!text) return;
    step(`executou: \`${text}\``);
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
      step(`erro: ${normalizeMessage(error.message || error)}`);
    }

    const blockLines = [`# ${safeSkillName}`, ...lines];
    await appendLogBlock(logFilePath, blockLines);
  }

  return {
    logFilePath,
    step,
    command,
    success: () => finalize({}),
    failure: (error) => finalize({ error }),
  };
}
