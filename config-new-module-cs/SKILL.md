---
name: config-new-module-cs
stack: csharp
description: Criar um novo módulo (projeto) de forma determinística no padrão C#/.NET multi-projeto, gerando scaffold em `src/<ProjectName>.<ModuleName>` (Class Library para Domínio/Aplicação), adicionando à solução e configurando referências. Usar quando o pedido envolver criação de novo módulo no monorepo .NET.
---

# Config New Module (C#)

## Overview

Padronizar a criação de novos módulos no projeto C#/.NET multi-projeto com duas entregas sincronizadas:

1. Projeto de Core em `src/ProjectName.<ModuleName>/` com `.csproj`, entidade de domínio placeholder, interface de repository e teste mínimo.
2. Integração no Backend: Adicionar referências e configurar DI no `Program.cs`.

## Workflow

1. Ler o nome do módulo solicitado pelo usuário.
2. Executar `node scripts/create-module-cs.mjs <module-name>`.
3. Conferir a estrutura criada em:
   - `src/ProjectName.<ModuleName>/ProjectName.<ModuleName>.csproj`
   - `src/ProjectName.<ModuleName>/Domain/Entities/<ModuleName>.cs`
   - `src/ProjectName.<ModuleName>/Domain/Repositories/I<ModuleName>Repository.cs`
4. Confirmar que o projeto foi adicionado à solução (`dotnet sln add`).
5. Confirmar que o Backend referencia o novo projeto.
6. Rodar `dotnet build` para validar.

## Commands

Criar módulo:

```bash
node config-new-module-cs/scripts/create-module-cs.mjs <module-name>
```

## Resources

- `agents/openai.yaml`: Configuração do agente.
- `scripts/create-module-cs.mjs`: Script de criação (placeholder).
- `assets/module-template.zip`: (Opcional) Template base para novos módulos.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
