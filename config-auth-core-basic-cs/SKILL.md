---
name: config-auth-core-basic-cs
stack: csharp
description: Gerenciar o núcleo de autenticação (Core) em C#. Usar quando o pedido envolver entidades de User, Use Cases de Login/Register e interfaces de provider de senha/token no domínio .NET.
---

# Config Auth Core Basic (C#)

## Overview

Manter as regras de negócio de autenticação no Core (Domínio e Aplicação) em C#.

## Localização

- `src/ProjectName.Core/Domain/Entities/User.cs`
- `src/ProjectName.Core/Domain/Repositories/IUserRepository.cs`
- `src/ProjectName.Core/Domain/Services/IPasswordHasher.cs`
- `src/ProjectName.Core/Domain/Services/ITokenProvider.cs`
- `src/ProjectName.Core/Application/UseCases/Auth/`

## Workflow

1. Definir entidades de domínio para User e Password.
2. Implementar Use Cases para Login e Register.
3. Definir interfaces para `IPasswordHasher` e `ITokenProvider`.

## Resources

- `agents/openai.yaml`: Configuração do agente.
- `scripts/create-auth-core-basic-cs.mjs`: Script de criação (placeholder).
- `assets/auth-core-basic-template-cs/`: Template completo do domínio de auth C#.
- `references/auth-core-contract-cs.md`: Contrato dos artefatos gerados.
