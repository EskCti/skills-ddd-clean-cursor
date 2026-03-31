---
name: config-auth-backend-basic-cs
stack: csharp
description: Criar/recriar o módulo de autenticação do backend C# com endpoints HTTP (Register/Login/Me), JWT com ASP.NET Core Authentication, controle de acesso Roles (Admin), integração com EF Core e Identity. Usar quando o pedido envolver bootstrap da camada backend auth no monorepo .NET.
---

# Config Auth Backend Basic (C#)

## Overview

Executar setup idempotente do módulo de autenticação backend C#, cobrindo:

- Módulo de Auth em `src/ProjectName.Backend/Modules/Auth/` com:
  - `AuthController.cs`: Endpoints de Login, Register, Me.
  - `JwtService.cs`: Geração de tokens.
  - `IdentityConfig.cs`: Setup do ASP.NET Identity e JWT.
  - `UserEntity.cs`: Modelo de persistência para usuários.
- Migrations EF Core para tabelas de usuários e roles.

## Workflow

1. Garantir que o `DbContext` está configurado.
2. Executar `node scripts/init-auth-backend-cs.mjs`.
3. Validar a criação dos controllers e serviços de Identity.
4. Rodar `dotnet ef migrations add AddAuthTables`.
5. Rodar `dotnet build`.

## Resources

- `agents/openai.yaml`: Configuração do agente.
- `scripts/init-auth-backend-cs.mjs`: Script de configuração.
- `assets/auth-backend-basic-template-cs/`: Template de infraestrutura (Controller, TokenProvider, PasswordHasher).
- `references/auth-backend-contract-cs.md`: Contrato dos artefatos gerados.

> **Dependências NuGet**: `BCrypt.Net-Next`, `Microsoft.AspNetCore.Authentication.JwtBearer`, `System.IdentityModel.Tokens.Jwt`.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais C#.
