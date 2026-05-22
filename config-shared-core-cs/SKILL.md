---
name: config-shared-core-cs
stack: csharp
description: Gerenciar e expandir o Shared Kernel (núcleo compartilhado) em C#/.NET. Usar quando o pedido envolver criação/ajuste de classes base (Entity, ValueObject, Result), exceções globais, interfaces transversais ou utilitários de domínio no projeto .NET.
---

# Config Shared Core (C#)

## Overview

Manter a base tecnológica do domínio (Shared Kernel) em C#, garantindo que as abstrações principais (`Entity`, `ValueObject`, `Result`, `IUseCase`) sejam consistentes e reutilizáveis em todos os módulos.

## Localização

- `apps/backend/ProjectName.Shared.Kernel/` (ou caminho de `backendAppPath` em `skills.config.json`)

## Workflow

1. Identificar a abstração a ser criada ou ajustada no Shared Kernel.
2. Implementar em C# seguindo o padrão de imutabilidade e nomenclatura PascalCase.
3. Garantir que a mudança não quebre os módulos existentes (compatibilidade).
4. Rodar testes unitários do Shared Kernel.

## Resources

- `agents/openai.yaml`: Configuração do agente.
- `scripts/create-shared-cs.mjs`: Script de manutenção do kernel (placeholder).
- `assets/shared-template-cs/`: Template completo do Shared Kernel (Entity, VO, Result).
- `references/shared-patterns-cs.md`: Padrões do kernel compartilhado C#.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
