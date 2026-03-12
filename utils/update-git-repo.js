#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const path = require('node:path');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

const COMMIT_TYPES = [
  { value: 'feat', label: 'feat (nova funcionalidade)' },
  { value: 'fix', label: 'fix (correcao de bug)' },
  { value: 'chore', label: 'chore (tarefa de manutencao)' },
  { value: 'docs', label: 'docs (documentacao)' },
  { value: 'refactor', label: 'refactor (refatoracao)' },
  { value: 'test', label: 'test (testes)' },
  { value: 'build', label: 'build (build/dependencias)' },
  { value: 'ci', label: 'ci (pipeline CI/CD)' },
  { value: 'perf', label: 'perf (performance)' },
  { value: 'style', label: 'style (estilo/formatacao)' },
  { value: 'fix', label: 'bug (alias para fix)' },
];

function printHelp() {
  console.log(`Uso:
  node .agents/skills/utils/update.js [--dry-run] [--no-push]

Descricao:
  Cria commit padronizado no formato Conventional Commits
  exclusivamente no repositorio das skills (onde este script esta).
  Nunca commita nada no repositorio pai/superprojeto.

Opcoes:
  --dry-run   Mostra o que seria feito sem executar git add/commit
  --no-push   Cria commit, mas nao executa push
  -h, --help  Exibe esta ajuda`);
}

function runGit(args, options = {}) {
  const result = spawnSync('git', args, {
    encoding: 'utf8',
    stdio: options.stdio || 'pipe',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const stderr = (result.stderr || '').trim();
    const stdoutText = (result.stdout || '').trim();
    const details = stderr || stdoutText || `exit ${result.status}`;
    const commandText = `git ${args.join(' ')}`;
    throw new Error(`Falha ao executar "${commandText}": ${details}`);
  }

  return (result.stdout || '').trim();
}

function runGitMaybe(args) {
  const result = spawnSync('git', args, {
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.error || result.status !== 0) {
    return '';
  }

  return (result.stdout || '').trim();
}

function resolveSkillsRepoRoot() {
  const scriptDir = path.resolve(__dirname);
  const repoRoot = runGitMaybe(['-C', scriptDir, 'rev-parse', '--show-toplevel']);
  if (!repoRoot) {
    throw new Error(`Nao foi possivel localizar um repositorio Git valido para as skills em: ${scriptDir}`);
  }
  return repoRoot;
}

async function ask(rl, question, { required = false, defaultValue = '' } = {}) {
  while (true) {
    const answer = (await rl.question(question)).trim();
    if (answer) return answer;
    if (defaultValue) return defaultValue;
    if (!required) return '';
    console.log('Valor obrigatorio.');
  }
}

async function askYesNo(rl, question, defaultYes = true) {
  const suffix = defaultYes ? ' [Y/n] ' : ' [y/N] ';
  while (true) {
    const answer = (await rl.question(`${question}${suffix}`)).trim().toLowerCase();
    if (!answer) return defaultYes;
    if (['y', 'yes', 's', 'sim'].includes(answer)) return true;
    if (['n', 'no', 'nao', 'não'].includes(answer)) return false;
    console.log('Resposta invalida. Use y/n.');
  }
}

async function askCommitType(rl) {
  console.log('\nEscolha o tipo de commit:');
  COMMIT_TYPES.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.label}`);
  });

  while (true) {
    const answer = (await rl.question('Tipo (numero ou nome): ')).trim().toLowerCase();
    if (!answer) {
      console.log('Tipo obrigatorio.');
      continue;
    }

    const num = Number(answer);
    if (Number.isInteger(num) && num >= 1 && num <= COMMIT_TYPES.length) {
      return COMMIT_TYPES[num - 1].value;
    }

    const found = COMMIT_TYPES.find((t) => t.value === answer || t.label.startsWith(answer));
    if (found) return found.value;

    console.log('Tipo invalido. Tente novamente.');
  }
}

function composeCommitMessage(type, subject) {
  return `${type}: ${subject}`;
}

function hasWorkingTreeChanges(repoRoot) {
  const output = runGit(['-C', repoRoot, 'status', '--porcelain']);
  return output.length > 0;
}

function hasStagedChanges(repoRoot, maybePath = '') {
  const args = ['-C', repoRoot, 'diff', '--cached', '--quiet'];
  if (maybePath) {
    args.push('--', maybePath);
  }
  const result = spawnSync('git', args, { stdio: 'pipe' });
  return result.status === 1;
}

function getCurrentBranch(repoRoot) {
  const branch = runGit(['-C', repoRoot, 'rev-parse', '--abbrev-ref', 'HEAD']);
  if (branch === 'HEAD') {
    throw new Error('Repositorio de skills esta em detached HEAD. Faça checkout de uma branch antes de commitar.');
  }
  return branch;
}

function hasOriginRemote(repoRoot) {
  const result = spawnSync('git', ['-C', repoRoot, 'remote', 'get-url', 'origin'], {
    stdio: 'pipe',
  });
  return result.status === 0;
}

function hasUpstreamBranch(repoRoot) {
  const result = spawnSync('git', ['-C', repoRoot, 'rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], {
    stdio: 'pipe',
  });
  return result.status === 0;
}

function commitRepo({ repoRoot, messageHeader, dryRun }) {
  if (dryRun) {
    console.log(`\n[dry-run] git -C "${repoRoot}" add -A`);
    console.log(`[dry-run] git -C "${repoRoot}" commit -m "${messageHeader}"`);
    return;
  }

  runGit(['-C', repoRoot, 'add', '-A'], { stdio: 'inherit' });

  if (!hasStagedChanges(repoRoot)) {
    throw new Error('Nao ha alteracoes para commitar apos git add -A.');
  }

  const commitArgs = ['-C', repoRoot, 'commit', '-m', messageHeader];
  runGit(commitArgs, { stdio: 'inherit' });
}

function pushRepo({ repoRoot, branch, dryRun }) {
  if (dryRun) {
    if (hasUpstreamBranch(repoRoot)) {
      console.log(`[dry-run] git -C "${repoRoot}" push`);
    } else {
      console.log(`[dry-run] git -C "${repoRoot}" push -u origin "${branch}"`);
    }
    return;
  }

  if (!hasOriginRemote(repoRoot)) {
    throw new Error('Repositorio de skills nao possui remoto "origin" configurado.');
  }

  const pushArgs = ['-C', repoRoot, 'push'];
  if (!hasUpstreamBranch(repoRoot)) {
    pushArgs.push('-u', 'origin', branch);
  }
  runGit(pushArgs, { stdio: 'inherit' });
}

async function main() {
  const args = new Set(process.argv.slice(2));
  if (args.has('-h') || args.has('--help')) {
    printHelp();
    return;
  }

  const dryRun = args.has('--dry-run');
  const noPush = args.has('--no-push');
  const repoRoot = resolveSkillsRepoRoot();
  const currentBranch = getCurrentBranch(repoRoot);

  console.log(`Repositorio alvo (skills): ${repoRoot}`);
  console.log(`Branch atual das skills: ${currentBranch}`);
  console.log('Escopo: somente repositorio das skills (nenhuma acao no repo pai).');

  if (!hasWorkingTreeChanges(repoRoot)) {
    console.log('Nao ha mudancas locais no repositorio de skills para commitar.');
    return;
  }

  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    const type = await askCommitType(rl);
    const subject = await ask(rl, 'Mensagem curta (obrigatoria): ', {
      required: true,
    });

    const commitMessage = composeCommitMessage(type, subject);
    console.log('\nCommit a ser criado:');
    console.log(`  ${commitMessage}`);

    const confirmCurrent = await askYesNo(rl, 'Confirma commit no repositorio de skills?', true);
    if (!confirmCurrent) {
      console.log('Operacao cancelada.');
      return;
    }

    commitRepo({
      repoRoot,
      messageHeader: commitMessage,
      dryRun,
    });
    console.log('Commit no repositorio de skills concluido.');

    if (noPush) {
      console.log('Push desabilitado por --no-push.');
      return;
    }

    const confirmPush = await askYesNo(
      rl,
      `Confirma push da branch "${currentBranch}" para o remoto do repo de skills?`,
      true,
    );
    if (!confirmPush) {
      console.log('Push cancelado.');
      return;
    }

    pushRepo({
      repoRoot,
      branch: currentBranch,
      dryRun,
    });
    console.log('Push no repositorio de skills concluido.');
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
