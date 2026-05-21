---
name: config-new-module
stack: typescript
description: Criar um novo módulo de forma determinística no padrão do projeto Workspace, gerando scaffold em `packages/*`, `apps/backend/src/modules/*` e `apps/web` (modules + rota principal). Usar quando o pedido envolver criação de módulo full-stack no monorepo com package TypeScript, módulo NestJS e dashboard inicial no web.
---

# Config New Module

## Overview

Padronizar a criação de novos módulos no monorepo com três entregas sincronizadas:

1. pacote em `<dirname(sharedModulePath)>/<module-name>` (template TypeScript);
2. módulo backend em `<backendAppPath>/src/modules/<module-name>` (Nest module + controller + provider Prisma de módulo) e modelo Prisma inicial em `<backendAppPath>/prisma/models/<module-name>.model.prisma`;
3. módulo frontend em `<frontendAppPath>/src/modules/<module-name>` quando `src/` existir; caso não exista, em `<frontendAppPath>/modules/<module-name>`, sempre com pastas `components` e `pages`, e rota principal em `app/(private)/<module-name>/page.tsx` quando o grupo `(private)` existir (fallback para `app/<module-name>/page.tsx`), com `layout.tsx` de módulo e menu lateral específico do módulo.

Executar o script Node da skill para receber o nome do módulo e gerar os arquivos mínimos de código e teste, sem depender de shell específico de SO.
O namespace e diretórios padrão devem ser resolvidos por configuração global compartilhada em `skills.config.json` (`.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`).

## Workflow

1. Ler o nome do módulo solicitado pelo usuário.
2. Executar `node scripts/create-module.mjs <module-name>`.
3. Namespace é resolvido por precedência: `--scope` > `PROJECT_NAMESPACE`/`SKILLS_NAMESPACE` > `skills.config.local.json` > `skills.config.json` > fallback automático.
4. Conferir a estrutura criada em:
   - `<dirname(sharedModulePath)>/<module-name>`
   - `<backendAppPath>/src/modules/<module-name>`
- `<backendAppPath>/prisma/models/<module-name>.model.prisma`
- `<backendAppPath>/test/<module-name>.e2e-spec.ts`
- `e2e/<module-name>.spec.ts`
- `<frontendAppPath>/src/modules/<module-name>` **ou** `<frontendAppPath>/modules/<module-name>` (conforme existência da pasta `src`)
   - `<frontendAppPath>/<app-base>/(private)/<module-name>` **ou** `<frontendAppPath>/<app-base>/<module-name>` (fallback)
5. Confirmar que o package contém API mínima (`getModuleName`) e teste `index.test.ts`.
6. Confirmar que o backend contém `<module-name>.module.ts`, `<module-name>.controller.ts`, `<module-name>.prisma.ts`, e que o módulo foi registrado no `app.module.ts`.
7. Confirmar que o frontend contém dashboard template, `layout.tsx` do módulo com menu lateral embutido e rota principal para acessar o módulo.
   - o arquivo `app/(private)/<module-name>/layout.tsx` (ou fallback equivalente sem `(private)`) deve existir para todo módulo.
   - o menu lateral do módulo deve seguir padrão obrigatório: primeiro item "Voltar" (`/dashboard`), linha divisória, label com nome do módulo e itens específicos do módulo.
   - os rótulos dos menus (principal e lateral) devem respeitar grafia PT-BR com acentuação correta quando aplicável.
   - por padrão (módulo novo), o único item específico é `Visão Geral <Nome do Módulo>` apontando para `/<module-name>`.
   - o componente `<module-name>-dashboard.component.tsx` deve usar `EmptyDashboardState` de `shared/components/ui/empty-dashboard-state.tsx` quando esse componente existir no projeto, passando `moduleName` quando aplicável.
   - o `layout.tsx` do módulo em `app/(private)/<module-name>` deve encapsular o menu lateral localmente (padrão do `auth/layout.tsx`) usando `SidebarMenu` + `SidebarMenuItem` e passando o sidebar para `PrivateAppShell` (de `modules/auth/template/private-app-shell.component.tsx`).
   - o menu lateral do módulo não deve depender de arquivos `data/*-menu.data.ts` nem de `*-navigation.component.tsx`.
   - o menu principal da aplicação deve ser atualizado em `app/(private)/dashboard/layout.tsx`, adicionando o novo módulo em `moduleItems` com `href`, `label` (PT-BR) e ícone determinístico do `lucide-react`.
8. Confirmar que `apps/backend/package.json` e `apps/web/package.json` possuem a dependência `<scope>/<module-name>`.
9. Confirmar specs E2E gerados: `apps/backend/test/<module-name>.e2e-spec.ts` e `e2e/<module-name>.spec.ts` (web).
10. Executar análise semântica determinística (heurística de IA local) para ordenar o menu principal por frequência provável de uso e mover módulos administrativos para a parte inferior.
11. Registrar execução em `.log/skills.log` com título da skill e lista simples dos comandos/ações relevantes (sem timestamps e sem status), garantindo `.log/` no `.gitignore`.

## Commands

Criar módulo no namespace padrão do projeto:

```bash
node .agents/skills/config-new-module/scripts/create-module.mjs <module-name>
```

> Se o repositório estiver em `.cloud/skills`, ajuste o caminho do comando.

Definir namespace por variável de ambiente:

```bash
PROJECT_NAMESPACE=@namespace node .agents/skills/config-new-module/scripts/create-module.mjs <module-name>
```

Criar módulo com namespace explícito:

```bash
node .agents/skills/config-new-module/scripts/create-module.mjs <module-name> --scope @namespace
```

Sobrescrever diretório existente:

```bash
node .agents/skills/config-new-module/scripts/create-module.mjs <module-name> --force
```

## Output Contract

O script deve gerar exatamente:

- `<dirname(sharedModulePath)>/<module-name>/package.json`
- `<dirname(sharedModulePath)>/<module-name>/tsconfig.json`
- `<dirname(sharedModulePath)>/<module-name>/jest.config.ts`
- `<dirname(sharedModulePath)>/<module-name>/src/index.ts`
- `<dirname(sharedModulePath)>/<module-name>/test/index.test.ts`
- `<backendAppPath>/src/modules/<module-name>/<module-name>.controller.ts`
- `<backendAppPath>/src/modules/<module-name>/<module-name>.prisma.ts`
- `<backendAppPath>/src/modules/<module-name>/<module-name>.module.ts`
- `<backendAppPath>/src/modules/<module-name>/index.ts`
- `<backendAppPath>/prisma/models/<module-name>.model.prisma`
- `<backendAppPath>/test/<module-name>.e2e-spec.ts` (template `module-get`)
- `e2e/<module-name>.spec.ts` (Playwright web)
- atualização em `<backendAppPath>/src/app.module.ts` para importar e registrar `<ModuleName>Module`
- `<frontendAppPath>/src/modules/<module-name>/components/<module-name>-dashboard.component.tsx` **ou** `<frontendAppPath>/modules/<module-name>/components/<module-name>-dashboard.component.tsx`
- `<frontendAppPath>/src/modules/<module-name>/pages/dashboard.page.tsx` **ou** `<frontendAppPath>/modules/<module-name>/pages/dashboard.page.tsx`
- `<frontendAppPath>/src/modules/<module-name>/index.ts` **ou** `<frontendAppPath>/modules/<module-name>/index.ts`
- atualização em `<frontendAppPath>/src/app/(private)/dashboard/layout.tsx` (ou fallback equivalente sem `(private)`/sem `src`) adicionando entrada determinística do módulo em `moduleItems` no menu principal (incluindo ícone)
- `<frontendAppPath>/src/app/(private)/<module-name>/page.tsx` quando `(private)` existir, senão `<frontendAppPath>/src/app/<module-name>/page.tsx` (ou equivalente sem `src/`)
- `<frontendAppPath>/src/app/(private)/<module-name>/layout.tsx` quando `(private)` existir, senão `<frontendAppPath>/src/app/<module-name>/layout.tsx` (ou equivalente sem `src/`)
- atualização em `<backendAppPath>/package.json` com dependência `<scope>/<module-name>`
- atualização em `<frontendAppPath>/package.json` com dependência `<scope>/<module-name>`

Regra do dashboard do módulo:

- quando existir `shared/components/ui/empty-dashboard-state.tsx`, o arquivo `<module-name>-dashboard.component.tsx` deve referenciar `EmptyDashboardState` como conteúdo principal do dashboard.
- a prop `moduleName` deve ser opcional no `EmptyDashboardState`; quando nao informada, manter titulo padrao "Dashboard Vazio".

Regra do menu principal:

- o módulo novo deve aparecer no menu principal da aplicação, com item navegável e ícone do `lucide-react` escolhido por mapeamento determinístico baseado no nome do módulo.
- os labels do menu principal devem considerar acentuação correta em PT-BR (ex.: `Autenticação`, `Cartões`, `Transações`).
- a ordenação deve priorizar frequência provável de uso (módulos mais usados no topo) e manter módulos administrativos no bloco inferior.
- a classificação deve ser inteligente, mas reproduzível: mesma entrada deve resultar na mesma ordem.

Regra do menu lateral por módulo:

- todo módulo deve ter um menu lateral específico para suas páginas (`/<module-name>` e subrotas).
- esse menu deve ser definido diretamente em `app/(private)/<module-name>/layout.tsx`, seguindo o mesmo padrão estrutural do `app/(private)/auth/layout.tsx`.
- o primeiro item obrigatório deve ser `Voltar`, navegando para `/dashboard`.
- após o item `Voltar`, deve existir separador visual (linha divisória), seguido de label com o nome do módulo.
- os demais itens são os itens específicos do módulo.
- no scaffold inicial, o único item específico deve ser `Visão Geral <Nome do Módulo>`.
- o `layout.tsx` deve renderizar `PrivateAppShell` com sidebar local do módulo, sem criar arquivos separados de menu/data.

## Naming Convention

- Pastas: sempre minúsculas em kebab-case.
- Arquivos: sempre minúsculos em kebab-case, com sufixo de tipo no nome (ex.: `branch.controller.ts`, `branch.module.ts`, `branch-dashboard.component.tsx`, `dashboard.page.tsx`).
- Convenção global compartilhada: `../skills-standards.md`.

Consultar `references/module-template.md` para o contrato completo dos arquivos gerados.

## Shared Config

- Arquivo versionado: `skills.config.json` (`.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`)
- Override local (gitignored): `skills.config.local.json` no mesmo diretório da configuração principal
- Exemplo local: `skills.config.local.example.json` no mesmo diretório da configuração principal
- Log local de execução: `.log/skills.log` (não versionado; `.log/` é adicionado ao `.gitignore` automaticamente, sem metadados extras).

## Risk Logging Guardrails

- Registrar fatos de execucao em `.log/skills.log` com marcador no inicio da linha.
- Marcadores minimos esperados: `[CMD]`, `[FILE_CREATE]`, `[FILE_UPDATE]`, `[FILE_DELETE]`, `[DIR_CREATE]`, `[RISK]`, `[FAIL]`, `[AI]`.
- Sempre registrar `[RISK]` quando houver sobrescrita, exclusao, rename/move, ou fallback forcado em arquivos/pastas.
- Toda falha inesperada deve gerar `[FAIL]` com descricao factual curta do evento.
- Operacoes de terminal e alteracoes de arquivos devem passar pelos utilitarios compartilhados em `../utils` para manter rastreabilidade consistente.

## Global Standards

- Consultar `../skills-standards.md` para padroes globais de nomenclatura e convencoes gerais entre skills.
