---
name: git-organized-commits
stack: agnostic
description: Criar commits Git organizados por área de implementação (sem git add .), mensagens descritivas convencionais e corpo de PR pronto para copiar. Usar quando o pedido envolver commitar, organizar commits, preparar PR manual ou revisar staging antes de push.
---

# Git Organized Commits

## Overview

Workflow para **commits atômicos e revisáveis**: cada commit agrupa uma única intenção (skill, camada ou documentação), com mensagem que explica o **porquê**, nunca um `git add .` cego.

**Acionar somente quando o usuário pedir explicitamente para commitar** (não commitar de forma proativa).

---

## Protocolo obrigatório

### 1. Diagnóstico (sempre em paralelo)

```bash
git status
git diff
git diff --staged
git log -5 --oneline
```

Analisar arquivos **modificados** e **untracked** antes de decidir grupos.

### 2. Agrupar por intenção — NUNCA `git add .`

| Ordem sugerida | Prefixo commit | Paths / critério |
|----------------|----------------|------------------|
| 1 | `docs:` | `skills-standards.md`, convenções globais |
| 2 | `feat(req):` | `req-discovery/`, `req-ddd-modeling/`, `req-migration-strategy/`, `req-agile-planning/` |
| 3 | `feat(config):` | `config-project-fullstack/` |
| 4 | `feat(config):` | `config-docker*/`, `config-cicd*/` |
| 5 | `feat(config):` | `config-project-angular/`, `config-project-vue/`, `config-project-flutter/`, `config-project-android/` |
| 6 | `feat(config):` | `config-project/` (E2E), `config-new-module*/` |
| 7 | `feat(config):` | `config-project-cs/` |
| 8 | `feat(test):` | `test-unit*/`, `test-e2e*/`, thresholds em `config-shared-core*`, `config-auth-core*` |
| 9 | `feat(frontend):` | `frontend-*-angular/`, `frontend-*-vue/` |
| 10 | `feat(mobile):` | `mobile-*-flutter/`, `mobile-*-android/` |
| 11 | `feat(config):` | `config-shared-web-angular/`, `config-shared-web-vue/`, `config-shared-web/`, `utils/init-frontend-shell.mjs` |
| 12 | `docs:` | `docs/`, `README.md` |
| 13 | `chore:` | ajustes pontuais restantes (1 skill, 1 linha) |

Adaptar grupos ao diff real. **Um commit = uma área coerente.** Se um arquivo pertence a dois grupos, escolher o domínio principal.

Consultar `references/commit-groups.md` para exemplos deste repositório.

### 3. Staging seletivo

```bash
git add path/específico ...
git add pasta/skill/
```

Proibido:

```bash
git add .
git commit -a    # salvo instrução explícita do usuário
```

### 4. Mensagem de commit

Formato:

```
<tipo>(<escopo opcional>): <resumo imperativo, ≤72 chars>

<1–2 frases: por que esta mudança existe e o que desbloqueia>
```

Tipos: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.

Sempre via HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
feat(config): adicionar shells web Tailwind para Angular e Vue

Scripts idempotentes com sidebar, topbar e rodapé; alinha bootstrap
full-stack ao padrão visual do config-shared-web (Next.js).
EOF
)"
```

### 5. Verificação pós-commit

```bash
git status
```

Se hook de pre-commit modificar arquivos → **novo commit** (nunca `--amend` salvo regras de amend do projeto).

### 6. Corpo de PR (quando solicitado)

Gerar bloco com **4 crases** (````) para o usuário colar no PR manual:

````markdown
## Summary
...

## Test plan
- [ ] ...
````

Template completo: `references/pr-body-template.md`.

---

## Regras de segurança Git

- **Nunca** `git config` alterar
- **Nunca** push unless pedido
- **Nunca** force push em main/master
- **Nunca** `--no-verify` unless pedido
- **Nunca** commitar `.env`, credenciais, secrets
- **Nunca** commit vazio

---

## Saída esperada ao usuário

Após a sequência de commits, informar:

1. Lista `hash — mensagem` de cada commit criado
2. `git status` final (working tree clean ou o que restou)
3. Bloco PR em ```` se pedido
4. Aviso se algo ficou de fora e por quê

---

## References

- `references/commit-groups.md` — agrupamento por paths neste monorepo de skills
- `references/pr-body-template.md` — template PR com 4 crases
- `../skills-standards.md` — convenções globais do repositório

## Global Standards

- Consultar `../skills-standards.md` quando o commit incluir novos skills (verificar `agents/openai.yaml` + `stack:` no frontmatter).
