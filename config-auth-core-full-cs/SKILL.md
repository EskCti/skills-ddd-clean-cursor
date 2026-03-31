---
name: config-auth-core-full-cs
stack: csharp
description: Gerenciar o sistema completo de autenticação e autorização (RBAC) em C#. Usar quando o pedido envolver permissões complexas, múltiplos tenants ou integração avançada de identidade em .NET.
---

# Config Auth Core Full (C#)

## Overview

Expandir o núcleo de auth para suportar roles, permissões e multi-tenancy em C#.

## Workflow

1. Implementar `Role` e `Permission` no domínio.
2. Criar Use Cases para gestão de permissões.
3. Configurar políticas de autorização avançadas.

## Resources

- `agents/openai.yaml`: Configuração do agente.
- `scripts/create-auth-core-full-cs.mjs`: Script de criação (placeholder).
- `assets/README.md`: Estrutura do template RBAC no Core.
- `references/rbac-contract-cs.md`: Contrato de roles e permissões.
